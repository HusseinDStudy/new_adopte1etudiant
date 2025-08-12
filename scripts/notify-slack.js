// Minimal Slack webhook notifier (Node 18+ with global fetch)
// Usage:
//   SLACK_WEBHOOK_URL=... node scripts/notify-slack.js "Message"

const webhookUrl = process.env.SLACK_WEBHOOK_URL;
const message = process.argv.slice(2).join(' ') || 'Monitoring alert: one or more checks failed.';

if (!webhookUrl) {
  console.error('SLACK_WEBHOOK_URL is not set');
  process.exit(1);
}

async function send() {
  const payload = {
    text: message,
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('Slack notification failed:', res.status, await res.text());
    process.exit(1);
  } else {
    console.log('Slack notification sent');
  }
}

send().catch((err) => {
  console.error('Slack notification error:', err);
  process.exit(1);
});



