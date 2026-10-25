/*
Optional Trilium widget: adapt white-background diagrams in dark themes.
Based on https://github.com/SiriusXT/trilium-theme-blue
Add #widget to this JavaScript note and #disableAdjustImage to opt a note out.
Images stay visible while loading; non-matching and unreadable images keep their colors.
*/

const autoAdjustImage = true;
const autoAdjustColor = true;
const STYLE_ID = 'blue-theme-dark-content-adjustments';
const MODE_ATTRIBUTE = 'data-blue-image-adjustment';
const DISABLE_ATTRIBUTE = 'data-blue-disable-images';

// Match editor-produced HSL and browser-normalized RGB style attributes.
const highlightColors = [
    ['hsl(0,0%,0%)', 'rgb(0,0,0)', '0, 0, 0'],
    ['hsl(0,0%,30%)', 'rgb(77,77,77)', '77, 77, 77'],
    ['hsl(0,0%,60%)', 'rgb(153,153,153)', '153, 153, 153'],
    ['hsl(0,0%,90%)', 'rgb(230,230,230)', '230, 230, 230'],
    ['hsl(0,0%,100%)', 'rgb(255,255,255)', '255, 255, 255'],
    ['hsl(0,75%,60%)', 'rgb(230,76,76)', '230, 76, 76'],
    ['hsl(30,75%,60%)', 'rgb(230,153,76)', '230, 153, 76'],
    ['hsl(60,75%,60%)', 'rgb(230,230,76)', '230, 230, 76'],
    ['hsl(90,75%,60%)', 'rgb(153,230,76)', '153, 230, 76'],
    ['hsl(120,75%,60%)', 'rgb(76,230,76)', '76, 230, 76'],
    ['hsl(150,75%,60%)', 'rgb(76,230,153)', '76, 230, 153'],
    ['hsl(180,75%,60%)', 'rgb(76,230,230)', '76, 230, 230'],
    ['hsl(210,75%,60%)', 'rgb(76,153,230)', '76, 153, 230'],
    ['hsl(240,75%,60%)', 'rgb(76,76,230)', '76, 76, 230'],
    ['hsl(270,75%,60%)', 'rgb(153,76,230)', '153, 76, 230']
];

const highlightCss = highlightColors.map(([hsl, rgb, output]) => {
    const swatch = document.createElement('span');
    swatch.style.backgroundColor = hsl;
    const normalized = swatch.style.backgroundColor;
    const values = new Set([hsl, rgb, hsl.replaceAll(',', ', '), rgb.replaceAll(',', ', '),
        normalized, normalized.replaceAll(', ', ',')]);
    if (hsl === 'hsl(60,75%,60%)') {
        for (const value of ['yellow', 'rgb(255,255,0)', 'rgb(255, 255, 0)']) values.add(value);
    }
    const selectors = [...values].flatMap(value => ['', ' '].flatMap(space => [
        `[${MODE_ATTRIBUTE}="dark"] span[style*="background-color:${space}${value};"]`,
        `[${MODE_ATTRIBUTE}="dark"] span[style$="background-color:${space}${value}"]`
    ]));
    return `${selectors.join(',\n')} { background-color: rgba(${output}, 0.3) !important; }`;
}).join('\n');

let style = document.getElementById(STYLE_ID);
if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
}
style.textContent = `@media screen {
    ${autoAdjustImage ? `[${MODE_ATTRIBUTE}="dark"]:not([${DISABLE_ATTRIBUTE}]) img.imgInversion {
        filter: invert(88%) hue-rotate(180deg);
    }` : ''}
    ${autoAdjustColor ? highlightCss : ''}
}`;

module.exports = class BlueThemeDarkContent extends api.NoteContextAwareWidget {
    get position() { return 100; }
    static get parentWidget() { return 'note-detail-pane'; }

    doRender() {
        this.$widget = $('<span hidden aria-hidden="true"></span>');
        return this.$widget;
    }

    async refreshWithNote(note) {
        this.disconnect();
        if (!note || (!autoAdjustImage && !autoAdjustColor)) return;
        const split = document.querySelector(`.note-split[data-ntx-id="${CSS.escape(String(this.noteContext.ntxId))}"]`);
        if (!split) return;

        this.container = split.querySelector('.scrolling-container') || split;
        this.disableAdjustImage = note.isLabelTruthy('disableAdjustImage');
        this.imageSources = new WeakMap();
        this.onImageLoad = event => {
            if (event.target instanceof HTMLImageElement) this.adjustImage(event.target);
        };
        this.container.addEventListener('load', this.onImageLoad, true);
        this.container.addEventListener('error', this.onImageLoad, true);

        this.imageObserver = new MutationObserver(records => {
            for (const record of records) {
                if (record.type === 'attributes') {
                    if (record.target instanceof HTMLImageElement) {
                        this.imageSources.delete(record.target);
                        record.target.classList.remove('imgInversion', 'imgNotInversion');
                        this.adjustImage(record.target);
                    } else if (record.target.tagName === 'SOURCE') {
                        this.scanImages(record.target.closest('picture'));
                    }
                } else {
                    for (const node of record.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) this.scanImages(node);
                    }
                }
            }
        });
        this.imageObserver.observe(this.container, {
            childList: true, subtree: true, attributes: true,
            attributeFilter: ['src', 'srcset', 'sizes']
        });

        // Trilium can switch themes without reloading; watch both theme roots.
        this.themeObserver = new MutationObserver(() => this.updateMode());
        for (const element of [document.body, document.documentElement]) {
            this.themeObserver.observe(element, {
                attributes: true, attributeFilter: ['class', 'style', 'data-theme-id']
            });
        }
        this.updateMode();
    }

    updateMode() {
        if (!this.container) return;
        const theme = getComputedStyle(document.body).getPropertyValue('--theme-style').trim();
        this.dark = theme === 'dark';
        if (this.dark) this.container.setAttribute(MODE_ATTRIBUTE, 'dark');
        else this.container.removeAttribute(MODE_ATTRIBUTE);
        this.container.toggleAttribute(DISABLE_ATTRIBUTE, this.disableAdjustImage || !autoAdjustImage);
        if (this.dark && autoAdjustImage && !this.disableAdjustImage) this.scanImages(this.container);
    }

    scanImages(root) {
        if (!root || !this.dark || !autoAdjustImage || this.disableAdjustImage) return;
        if (root instanceof HTMLImageElement) this.adjustImage(root);
        root.querySelectorAll('img').forEach(img => this.adjustImage(img));
    }

    adjustImage(img) {
        if (!this.dark || !autoAdjustImage || this.disableAdjustImage || !this.container?.contains(img)) return;
        if (!img.complete) return; // A captured load/error event will retry it.
        const source = img.currentSrc || img.src;
        if (this.imageSources.get(img) === source) return;
        img.classList.remove('imgInversion', 'imgNotInversion');

        let invert = false;
        if (img.naturalWidth && img.naturalHeight) {
            try {
                // Bound sampling to 4096 pixels even for very large images.
                const canvas = document.createElement('canvas');
                const scale = Math.min(1, 64 / Math.max(img.naturalWidth, img.naturalHeight));
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let white = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] > 230 && pixels[i] > 200 && pixels[i + 1] > 200 && pixels[i + 2] > 200) white++;
                }
                // Transparent white artwork is not an opaque white page.
                invert = white / (pixels.length / 4) > 0.7;
            } catch {
                // Cross-origin, unsupported and broken images remain visible.
            }
        }
        img.classList.add(invert ? 'imgInversion' : 'imgNotInversion');
        this.imageSources.set(img, source);
    }

    disconnect() {
        this.imageObserver?.disconnect();
        this.themeObserver?.disconnect();
        if (this.container) {
            this.container.removeEventListener('load', this.onImageLoad, true);
            this.container.removeEventListener('error', this.onImageLoad, true);
            this.container.removeAttribute(MODE_ATTRIBUTE);
            this.container.removeAttribute(DISABLE_ATTRIBUTE);
        }
        this.container = null;
    }

    cleanup() {
        this.disconnect();
        super.cleanup();
    }

    remove() {
        this.disconnect();
        super.remove();
    }

    async entitiesReloadedEvent({ loadResults }) {
        if (loadResults.isNoteContentReloaded(this.noteId) || loadResults.getAttributeRows().some(attr =>
            attr.type === 'label' && attr.noteId === this.noteId
        )) await this.refresh();
    }
};
