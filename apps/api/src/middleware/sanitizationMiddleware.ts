import { FastifyRequest, FastifyReply } from 'fastify';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import validator from 'validator';

// Create a new JSDOM instance for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Configure DOMPurify to be more restrictive
purify.setConfig({
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [], // No attributes allowed
  KEEP_CONTENT: true, // Keep text content but strip all HTML
});

/**
 * Sanitizes a string value to prevent XSS attacks
 */
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') {
    return value;
  }

  // First pass: Remove HTML tags and dangerous content
  let sanitized = purify.sanitize(value);

  // Second pass: Escape any remaining problematic characters
  sanitized = validator.escape(sanitized);

  // Third pass: Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '')
                      .replace(/data:/gi, '')
                      .replace(/vbscript:/gi, '')
                      .replace(/file:/gi, '')
                      .replace(/about:/gi, '');

  return sanitized.trim();
};

/**
 * Validates and sanitizes URL fields
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const lowerUrl = url.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.includes(protocol)) {
      throw new Error('Invalid URL protocol detected');
    }
  }

  // Only allow HTTP and HTTPS URLs
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'], 
    require_protocol: true,
    require_valid_protocol: true 
  })) {
    throw new Error('Invalid URL format');
  }

  // Return the URL without escaping, since we've already validated it
  return url;
};

/**
 * Validates email addresses strictly
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const trimmedEmail = email.trim();

  if (!validator.isEmail(trimmedEmail, { 
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: false,
    require_tld: true 
  })) {
    throw new Error('Invalid email format');
  }

  // Additional checks for dangerous characters
  if (trimmedEmail.includes('<') || trimmedEmail.includes('>') || 
      trimmedEmail.includes('"') || trimmedEmail.includes('\'') ||
      trimmedEmail.includes('\\') || trimmedEmail.includes('/')) {
    throw new Error('Email contains invalid characters');
  }

  return trimmedEmail;
};

/**
 * Recursively sanitizes object properties
 */
const sanitizeObject = (obj: any, skipFields: string[] = [], currentPath: string = ''): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    // If current path is in skipFields, don't sanitize the array
    if (skipFields.includes(currentPath)) {
      return obj;
    }
    return obj.map((item, index) => sanitizeObject(item, skipFields, `${currentPath}[${index}]`));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      // Skip fields that should not be sanitized
      if (skipFields.includes(key)) {
        sanitized[key] = value;
      } else if (key === 'email') {
        try {
          sanitized[key] = sanitizeEmail(value as string);
        } catch (error) {
          throw new Error(`Invalid email: ${(error as Error).message}`);
        }
      } else if (key === 'cvUrl' || key.toLowerCase().includes('url')) {
        try {
          sanitized[key] = sanitizeUrl(value as string);
        } catch (error) {
          throw new Error(`Invalid URL in ${key}: ${(error as Error).message}`);
        }
      } else {
        sanitized[key] = sanitizeObject(value, skipFields, newPath);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Input length validation
 */
export const validateInputLength = (value: string, maxLength: number = 1000): string => {
  if (typeof value === 'string' && value.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`);
  }
  return value;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizationMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
) => {
  try {
    if (request.body && typeof request.body === 'object') {
      // Validate input lengths for string fields
      const checkInputLengths = (obj: any) => {
        if (typeof obj === 'string') {
          validateInputLength(obj, 2000); // 2KB limit for individual fields
        } else if (Array.isArray(obj)) {
          obj.forEach(checkInputLengths);
        } else if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach(checkInputLengths);
        }
      };

      checkInputLengths(request.body);

      // Sanitize the request body with skip fields
      const skipFields = ['skills', 'message', 'firstName', 'lastName', 'name'];
      request.body = sanitizeObject(request.body, skipFields);
    }

    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      request.query = sanitizeObject(request.query, []);
    }

    done();
  } catch (error) {
    reply.code(400).send({ 
      message: 'Input validation failed', 
      details: (error as Error).message 
    });
  }
};

/**
 * Middleware specifically for authentication endpoints with stricter validation
 */
export const authSanitizationMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
) => {
  try {
    if (request.body && typeof request.body === 'object') {
      const body = request.body as any;

      // Strict validation for auth fields
      if (body.email) {
        body.email = sanitizeEmail(body.email);
      }

      if (body.firstName || body.lastName) {
        const namePattern = /^[a-zA-Z\s\-'.]+$/;
        ['firstName', 'lastName'].forEach(field => {
          if (body[field]) {
            validateInputLength(body[field], 50);
            if (!namePattern.test(body[field])) {
              throw new Error(`${field} contains invalid characters`);
            }
            body[field] = sanitizeString(body[field]);
          }
        });
      }

      if (body.name) { // Company name
        validateInputLength(body.name, 100);
        body.name = sanitizeString(body.name);
      }

      if (body.contactEmail) {
        body.contactEmail = sanitizeEmail(body.contactEmail);
      }

      // Skip sanitization entirely for specified fields
      const skipFields = ['skills', 'message'];
      
      // Sanitize other fields (but NOT password, URLs, names, or specified skip fields)
      const urlFields = ['cvUrl', 'logoUrl', 'website', 'url'];
      const protectedFields = ['email', 'firstName', 'lastName', 'name', 'contactEmail', 'password', 'currentPassword', 'newPassword'];
      
      for (const [key, value] of Object.entries(body)) {
        if (skipFields.includes(key)) {
          // Don't sanitize these fields at all
          continue;
        } else if (typeof value === 'string' && 
            !protectedFields.includes(key) &&
            !urlFields.includes(key)) {
          body[key] = sanitizeString(value);
        }
      }

      request.body = body;
    }

    done();
  } catch (error) {
    reply.code(400).send({ 
      message: 'Authentication input validation failed', 
      details: (error as Error).message 
    });
  }
};

export default sanitizationMiddleware; 