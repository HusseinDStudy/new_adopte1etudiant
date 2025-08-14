import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';
import { useA11y } from '../../theme/A11yProvider';
import { useTranslation } from 'react-i18next';
import { Accessibility as AccessibilityIcon } from 'lucide-react';

const srLiveStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  border: 0,
};

export const AccessibilityPanel: React.FC = () => {
  const { prefs, setPrefs, reset } = useA11y();
  const liveRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const tt = (key: string, defaultValue: string) => {
    const val = t(key, { defaultValue }) as string;
    return val === key ? defaultValue : val;
  };

  const announce = (msg: string) => {
    const el = liveRef.current;
    if (el) {
      el.textContent = '';
      setTimeout(() => { el.textContent = msg; }, 10);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-md p-2 text-gray-700 hover:bg-gray-100" aria-label={tt('a11y.openPanel', 'Accessibility')}>
          <AccessibilityIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent role="dialog" aria-modal="true" aria-labelledby="a11y-title" aria-describedby="a11y-desc">
        <DialogTitle id="a11y-title">{tt('a11y.title', 'Accessibility preferences')}</DialogTitle>
        <DialogDescription id="a11y-desc">{tt('a11y.description', 'Adjust text size, motion and other preferences.')}</DialogDescription>

        <div role="region" aria-live="polite" aria-atomic="true" style={srLiveStyles} ref={liveRef} />

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-neutral-900">{tt('a11y.textSize.label', 'Text size')}</legend>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="textSize" value="normal" checked={prefs.textSize === 'normal'} onChange={() => { setPrefs({ textSize: 'normal' }); announce(tt('a11y.sr.textSizeSetNormal', 'Text size set to normal')); }} />
                {tt('a11y.textSize.normal', 'Normal')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="textSize" value="large" checked={prefs.textSize === 'large'} onChange={() => { setPrefs({ textSize: 'large' }); announce(tt('a11y.sr.textSizeSetLarge', 'Text size set to large')); }} />
                {tt('a11y.textSize.large', 'Large')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="textSize" value="xlarge" checked={prefs.textSize === 'xlarge'} onChange={() => { setPrefs({ textSize: 'xlarge' }); announce(tt('a11y.sr.textSizeSetXlarge', 'Text size set to extra large')); }} />
                {tt('a11y.textSize.xlarge', 'Extra-large')}
              </label>
            </div>
          </fieldset>

          {/* High contrast removed: default theme meets AA; respecting system forced-colors */}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-neutral-900">{tt('a11y.motion.label', 'Motion')}</legend>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => { setPrefs({ reduceMotion: e.target.checked }); announce(e.target.checked ? tt('a11y.sr.reduceMotionEnabled', 'Reduced motion enabled') : tt('a11y.sr.reduceMotionDisabled', 'Reduced motion disabled')); }} />
              {tt('a11y.motion.reduce', 'Reduce motion')}
            </label>
          </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-neutral-900">{tt('a11y.reading.label', 'Reading')}</legend>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={prefs.dyslexiaFriendly} onChange={(e) => { setPrefs({ dyslexiaFriendly: e.target.checked }); announce(e.target.checked ? tt('a11y.sr.dyslexiaEnabled', 'Dyslexia-friendly font enabled') : tt('a11y.sr.dyslexiaDisabled', 'Dyslexia-friendly font disabled')); }} />
                {tt('a11y.reading.dyslexiaFont', 'Dyslexia-friendly font')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" aria-label={tt('a11y.reading.underlineLinks', 'Underline links')} checked={prefs.underlineLinks} onChange={(e) => { setPrefs({ underlineLinks: e.target.checked }); announce(e.target.checked ? tt('a11y.sr.underlineLinksEnabled', 'Underline links enabled') : tt('a11y.sr.underlineLinksDisabled', 'Underline links disabled')); }} />
                {tt('a11y.reading.underlineLinks', 'Underline links')}
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={prefs.grayscaleMedia} onChange={(e) => { setPrefs({ grayscaleMedia: e.target.checked }); announce(e.target.checked ? tt('a11y.sr.grayscaleEnabled', 'Grayscale media enabled') : tt('a11y.sr.grayscaleDisabled', 'Grayscale media disabled')); }} />
                {tt('a11y.reading.grayscaleMedia', 'Grayscale images and media')}
              </label>
            </fieldset>

          <div className="flex items-center justify-between pt-2">
            <button type="button" className="rounded-md bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200" onClick={() => { reset(); announce(tt('a11y.sr.reset', 'Accessibility preferences reset to defaults')); }}>{tt('a11y.reset', 'Reset to defaults')}</button>
            <DialogClose asChild>
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{tt('common.close', 'Close')}</button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityPanel;


