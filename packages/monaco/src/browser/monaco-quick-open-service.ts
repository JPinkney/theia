/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject, postConstruct } from 'inversify';
import { MessageType } from '@theia/core/lib/common/message-service-protocol';
import {
    QuickOpenService, QuickOpenModel, QuickOpenOptions, QuickOpenItem, QuickOpenGroupItem,
    QuickOpenMode, KeySequence, QuickOpenActionProvider, QuickOpenAction, ResolvedKeybinding,
    KeyCode, Key, KeybindingRegistry, TitleButton
} from '@theia/core/lib/browser';
import { KEY_CODE_MAP } from './monaco-keycode-map';
import { ContextKey } from '@theia/core/lib/browser/context-key-service';
import { MonacoContextKeyService } from './monaco-context-key-service';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { BuiltinThemeProvider, ThemeService } from '@theia/core/lib/browser/theming';
import URI from '@theia/core/lib/common/uri';
import { DisposableCollection } from '@theia/core';

export interface MonacoQuickOpenControllerOpts extends monaco.quickOpen.IQuickOpenControllerOpts {
    /**
     * Extended options for inputbox
     */
    busy?: boolean
    enabled?: boolean;
    step?: number | undefined
    title?: string | undefined
    totalSteps?: number | undefined
    buttons?: ReadonlyArray<TitleButton>
    /**
     * End of extended options for input box
     */

    prefix?: string;
    password?: boolean;
    ignoreFocusOut?: boolean;
    onType?(lookFor: string, acceptor: (model: monaco.quickOpen.QuickOpenModel) => void): void;
    onClose?(canceled: boolean): void;
}

class MonacoTitleBar {

    private readonly onDidTriggerButtonEmitter: Emitter<TitleButton>;
    private _isAttached: boolean;

    private titleElement: HTMLElement;

    private _title: string | undefined;
    private _step: number | undefined;
    private _totalSteps: number | undefined;
    private _buttons: ReadonlyArray<TitleButton>;

    private disposableCollection: DisposableCollection;
    constructor() {
        this.titleElement = document.createElement('h3');

        this.disposableCollection = new DisposableCollection();
        this.disposableCollection.push(this.onDidTriggerButtonEmitter = new Emitter());
    }

    get onDidTriggerButton() {
        return this.onDidTriggerButtonEmitter.event;
    }

    get isAttached(): boolean {
        return this._isAttached;
    }

    set isAttached(isAttached: boolean) {
        this._isAttached = isAttached;
    }

    set title(title: string | undefined) {
        this._title = title;
        this.updateInnerTitleText();
    }

    get title(): string | undefined {
        return this._title;
    }

    set step(step: number | undefined) {
        this._step = step;
        this.updateInnerTitleText();
    }

    get step(): number | undefined {
        return this._step;
    }

    set totalSteps(totalSteps: number | undefined) {
        this._totalSteps = totalSteps;
        this.updateInnerTitleText();
    }

    get totalSteps(): number | undefined {
        return this._totalSteps;
    }

    set buttons(buttons: ReadonlyArray<TitleButton> | undefined) {
        if (buttons === undefined) {
            this._buttons = [];
            return;
        }

        this._buttons = buttons;
    }

    get buttons() {
        return this._buttons;
    }

    private updateInnerTitleText(): void {
        let innerTitle = '';

        if (this.title) {
            innerTitle = this.title + ' ';
        }

        if (this.step && this.totalSteps) {
            innerTitle += `(${this.step} / ${this.totalSteps})`;
        } else if (this.step) {
            innerTitle += this.step;
        }

        this.titleElement.innerText = innerTitle;
    }

    // Left buttons are for the buttons dervied from QuickInputButtons
    private getLeftButtons() {
        if (this._buttons === undefined || this._buttons.length === 0) {
            return [];
        }
        return this._buttons.filter(val => val.location === 0);
    }

    /**
     * Right buttons are an implementation of the QuickInputButton
     * interface
     */
    private getRightButtons() {
        if (this._buttons === undefined || this._buttons.length === 0) {
            return [];
        }
        return this._buttons.filter(val => val.location === 1);
    }

    /**
     * Take in a button from getLeftButtons or getRightButtons
     * and create the actual HTML elements for it
     */
    private createButtonElement(buttons: TitleButton[], themeID: string) {
        const buttonDiv = document.createElement('div');
        buttonDiv.style.display = 'inline-flex';
        for (const b of buttons) {
            const a = document.createElement('a');
            a.style.width = '20px';
            a.style.height = '20px';

            if ('light' in b.iconPath || 'dark' in b.iconPath) {
                const potentialIcon = b.iconPath as { dark: URI, light: URI };
                a.style.backgroundImage =  `url(\'${themeID === BuiltinThemeProvider.lightTheme.id ? potentialIcon.light : potentialIcon.dark}\')`;
            } else {
                console.log('its instance of URI');
                a.style.backgroundImage = `url(\'${b.iconPath.toString()}\')`;
            }
            if (b.iconClass) {
                const splitClassList = b.iconClass.split(' '); // a.classList.add does not accept whitespace
                for (const clazz of splitClassList) {
                    a.classList.add(clazz);
                }
            }
            a.style.display = 'block';
            a.title = b.tooltip ? b.tooltip : '';
            a.onclick = () => {
                this.onDidTriggerButtonEmitter.fire(b);
            };
            buttonDiv.appendChild(a);
        }
        return buttonDiv;
    }

    public attachTitleBar(themeID: string) {
        // Create a div that contains all the new title top stuff
        const div = document.createElement('div');
        div.style.height = '1%'; // Reset the height to be valid
        div.style.display = 'flex';
        div.style.flexDirection = 'row';
        div.style.flexWrap = 'wrap';
        div.style.justifyContent = 'flex-start';
        div.style.alignItems = 'center';
        // div.style.textAlign = 'center';

        /**
         * The stucture of this is
         * <div> left buttons </div>
         * <h3> the title etc </h3>
         * <div> right buttons </div>
         */
        const leftButtonDiv = document.createElement('div'); // Holds all the buttons that get added to the left
        // leftButtonDiv.style.display = 'inherit';
        leftButtonDiv.style.flex = '1';
        leftButtonDiv.style.textAlign = 'left';

        leftButtonDiv.appendChild(this.createButtonElement(this.getLeftButtons(), themeID));

        const rightButtonDiv = document.createElement('div');
        rightButtonDiv.style.flex = '1';
        rightButtonDiv.style.textAlign = 'right';

        rightButtonDiv.appendChild(this.createButtonElement(this.getRightButtons(), themeID));

        // Build the string that is needed for the title
        this.updateInnerTitleText();

        this.titleElement.style.flex = '1';
        this.titleElement.style.textAlign = 'center';
        this.titleElement.style.margin = '5px 0';

        div.appendChild(leftButtonDiv);
        div.appendChild(this.titleElement);
        div.appendChild(rightButtonDiv);

        return div;
    }

    /**
     * Show the title bar if it is not attached AND
     * steps or title is defined.
     *
     * If the title bar is already showing and step and title
     * is defined then we need to update the properties
     */
    shouldShowTitleBar(): boolean {
        return ((this._step !== undefined ) || (this._title !== undefined));
    }

    dispose() {
        this.disposableCollection.dispose();
    }

}

@injectable()
export class MonacoQuickOpenService extends QuickOpenService {

    protected readonly container: HTMLElement;
    protected _widget: monaco.quickOpen.QuickOpenWidget | undefined;
    protected opts: MonacoQuickOpenControllerOpts | undefined;
    protected previousActiveElement: Element | undefined;
    protected titlePanel: MonacoTitleBar;
    protected titleBarContainer: HTMLElement;
    protected titleElement: HTMLElement | undefined;

    @inject(MonacoContextKeyService)
    protected readonly contextKeyService: MonacoContextKeyService;

    @inject(KeybindingRegistry)
    protected readonly keybindingRegistry: KeybindingRegistry;

    @inject(ThemeService)
    protected readonly themeService: ThemeService;

    protected inQuickOpenKey: ContextKey<boolean>;

    constructor() {
        super();

        const overlayWidgets = document.createElement('div');
        overlayWidgets.classList.add('quick-open-overlay');
        document.body.appendChild(overlayWidgets);

        const container = this.container = document.createElement('quick-open-container');
        container.style.position = 'absolute';
        container.style.top = '0px';
        container.style.right = '50%';
        overlayWidgets.appendChild(container);

        this.titlePanel = new MonacoTitleBar();
        this.titleBarContainer = document.createElement('div');
        this.titleBarContainer.style.backgroundColor = 'var(--theia-menu-color0)';
    }

    @postConstruct()
    protected init(): void {
        this.inQuickOpenKey = this.contextKeyService.createKey<boolean>('inQuickOpen', false);
    }

    open(model: QuickOpenModel, options?: QuickOpenOptions): void {
        this.internalOpen(new MonacoQuickOpenControllerOptsImpl(model, this.keybindingRegistry, options));
    }

    showDecoration(type: MessageType): void {
        let decoration = monaco.MarkerSeverity.Info;
        if (type === MessageType.Warning) {
            decoration = monaco.MarkerSeverity.Warning;
        } else if (type === MessageType.Error) {
            decoration = monaco.MarkerSeverity.Error;
        }
        this.showInputDecoration(decoration);
    }

    hideDecoration(): void {
        this.clearInputDecoration();
    }

    internalOpen(opts: MonacoQuickOpenControllerOpts): void {
        this.opts = opts;
        const activeContext = window.document.activeElement || undefined;
        if (!activeContext || !this.container.contains(activeContext)) {
            this.previousActiveElement = activeContext;
            this.contextKeyService.activeContext = activeContext instanceof HTMLElement ? activeContext : undefined;
        }

        this.titlePanel.title = this.opts.title;
        this.titlePanel.step = this.opts.step;
        this.titlePanel.totalSteps = this.opts.totalSteps;
        this.titlePanel.buttons = this.opts.buttons;
        if (this.titleElement) {
            this.titleElement.remove();
        }
        this.titlePanel.isAttached = false;
        if (this.titlePanel.shouldShowTitleBar()) {
            const currentTheme = this.themeService.getCurrentTheme();
            this.titleElement = this.titlePanel.attachTitleBar(currentTheme.id);
            this.titleBarContainer.appendChild(this.titleElement);
            this.titlePanel.isAttached = true;
        }

        this.hideDecoration();
        this.widget.show(this.opts.prefix || '');
        this.setPlaceHolder(opts.inputAriaLabel);
        this.setPassword(opts.password ? true : false);
        this.setEnabled(opts.enabled);
        this.inQuickOpenKey.set(true);
    }

    setPlaceHolder(placeHolder: string): void {
        const widget = this.widget;
        if (widget.inputBox) {
            widget.inputBox.setPlaceHolder(placeHolder);
        }
    }

    setPassword(isPassword: boolean): void {
        const widget = this.widget;
        if (widget.inputBox) {
            widget.inputBox.inputElement.type = isPassword ? 'password' : 'text';
        }
    }

    showInputDecoration(decoration: monaco.MarkerSeverity): void {
        const widget = this.widget;
        if (widget.inputBox) {
            const type = decoration === monaco.MarkerSeverity.Info ? 1 :
                decoration === monaco.MarkerSeverity.Warning ? 2 : 3;
            widget.inputBox.showMessage({ type, content: '' });
        }
    }

    clearInputDecoration(): void {
        const widget = this.widget;
        if (widget.inputBox) {
            widget.inputBox.hideMessage();
        }
    }

    setEnabled(isEnabled: boolean | undefined) {
        const widget = this.widget;
        if (widget.inputBox) {
            widget.inputBox.inputElement.readOnly = (isEnabled !== undefined) ? !isEnabled : false;
        }
    }

    private attachTitleBarIfNeeded(): void {
        if (this.titleElement) {
            this.titleElement.remove();
        }
        this.titlePanel.isAttached = false;
        if (this.titlePanel.shouldShowTitleBar()) {
            const currentTheme = this.themeService.getCurrentTheme();
            this.titleElement = this.titlePanel.attachTitleBar(currentTheme.id);
            this.titleBarContainer.appendChild(this.titleElement);
            this.titlePanel.isAttached = true;
        }
    }

    setStep(step: number | undefined) {
        this.titlePanel.step = step;
        this.attachTitleBarIfNeeded();
    }

    setTitle(title: string | undefined) {
        this.titlePanel.title = title;
        this.attachTitleBarIfNeeded();
    }

    setTotalSteps(totalSteps: number | undefined) {
        this.titlePanel.totalSteps = totalSteps;
    }

    setButtons(buttons: ReadonlyArray<TitleButton>) {
        this.titlePanel.buttons = buttons;
        this.attachTitleBarIfNeeded();
    }

    setValue(value: string | undefined) {
        if (this.widget && this.widget.inputBox) {
            this.widget.inputBox.inputElement.value = (value !== undefined) ? value : '';
        }
    }

    protected get widget(): monaco.quickOpen.QuickOpenWidget {
        if (this._widget) {
            return this._widget;
        }
        this._widget = new monaco.quickOpen.QuickOpenWidget(this.container, {
            onOk: () => {
                this.previousActiveElement = undefined;
                this.contextKeyService.activeContext = undefined;
                this.onClose(false);
            },
            onCancel: () => {
                if (this.previousActiveElement instanceof HTMLElement) {
                    this.previousActiveElement.focus();
                }
                this.previousActiveElement = undefined;
                this.contextKeyService.activeContext = undefined;
                this.onClose(true);
            },
            onType: lookFor => this.onType(lookFor || ''),
            onFocusLost: () => {
                if (this.opts && this.opts.ignoreFocusOut !== undefined) {
                    if (this.opts.ignoreFocusOut === false) {
                        this.onClose(true);
                    }
                    return this.opts.ignoreFocusOut;
                } else {
                    return false;
                }
            }
        }, {});
        this.attachQuickOpenStyler();
        const newWidget = this._widget.create();
        newWidget.prepend(this.titleBarContainer); // Prepend the outer div
        return this._widget;
    }

    get onDidTriggerButton(): Event<TitleButton> {
        return this.titlePanel.onDidTriggerButton;
    }

    protected attachQuickOpenStyler(): void {
        if (!this._widget) {
            return;
        }
        const themeService = monaco.services.StaticServices.standaloneThemeService.get();
        const detach = monaco.theme.attachQuickOpenStyler(this._widget, themeService);
        const dispose = themeService.onThemeChange(() => {
            detach.dispose();
            this.attachQuickOpenStyler();
            dispose.dispose();
        });
    }

    protected onClose(cancelled: boolean): void {
        if (this.opts && this.opts.onClose) {
            this.opts.onClose(cancelled);
        }
        this.titlePanel.dispose();
        this.inQuickOpenKey.set(false);
    }

    protected async onType(lookFor: string): Promise<void> {
        const opts = this.opts;
        if (this.widget && opts) {
            if (opts.onType) {
                opts.onType(lookFor, model =>
                    this.widget.setInput(model, opts.getAutoFocus(lookFor), opts.inputAriaLabel));
            } else {
                const m = opts.getModel(lookFor);
                this.widget.setInput(m, opts.getAutoFocus(lookFor), opts.inputAriaLabel);
            }
        }
    }

}

export class MonacoQuickOpenControllerOptsImpl implements MonacoQuickOpenControllerOpts {

    protected readonly options: QuickOpenOptions.Resolved;
    readonly password?: boolean;

    constructor(
        protected readonly model: QuickOpenModel,
        protected readonly keybindingService: TheiaKeybindingService,
        options?: QuickOpenOptions
    ) {
        this.model = model;
        this.options = QuickOpenOptions.resolve(options);
        this.password = this.options.password;
    }

    get busy(): boolean {
        return this.options.busy;
    }

    get enabled(): boolean {
        return this.options.enabled;
    }

    get step(): number | undefined {
        return this.options.step;
    }

    get title(): string | undefined {
        return this.options.title;
    }

    get totalSteps(): number | undefined {
        return this.options.totalSteps;
    }

    get prefix(): string {
        return this.options.prefix;
    }

    get ignoreFocusOut(): boolean {
        return this.options.ignoreFocusOut;
    }

    get inputAriaLabel(): string {
        return this.options.placeholder || '';
    }

    get buttons() {
        return this.options.buttons || [];
    }

    onClose(cancelled: boolean): void {
        this.options.onClose(cancelled);
    }

    private toOpenModel(lookFor: string, items: QuickOpenItem[], actionProvider?: QuickOpenActionProvider): monaco.quickOpen.QuickOpenModel {
        const entries: monaco.quickOpen.QuickOpenEntry[] = [];
        for (const item of items) {
            const entry = this.createEntry(item, lookFor);
            if (entry) {
                entries.push(entry);
            }
        }
        if (this.options.fuzzySort) {
            entries.sort((a, b) => monaco.quickOpen.compareEntries(a, b, lookFor));
        }
        return new monaco.quickOpen.QuickOpenModel(entries, actionProvider ? new MonacoQuickOpenActionProvider(actionProvider) : undefined);
    }

    getModel(lookFor: string): monaco.quickOpen.QuickOpenModel {
        throw new Error('getModel not supported!');
    }

    onType(lookFor: string, acceptor: (model: monaco.quickOpen.QuickOpenModel) => void): void {
        this.model.onType(lookFor, (items, actionProvider) => {
            const result = this.toOpenModel(lookFor, items, actionProvider);
            acceptor(result);
        });
    }

    protected createEntry(item: QuickOpenItem, lookFor: string): monaco.quickOpen.QuickOpenEntry | undefined {
        if (this.options.skipPrefix) {
            lookFor = lookFor.substr(this.options.skipPrefix);
        }
        const { fuzzyMatchLabel, fuzzyMatchDescription, fuzzyMatchDetail } = this.options;
        const labelHighlights = fuzzyMatchLabel ? this.matchesFuzzy(lookFor, item.getLabel(), fuzzyMatchLabel) : item.getLabelHighlights();
        const descriptionHighlights = fuzzyMatchDescription ? this.matchesFuzzy(lookFor, item.getDescription(), fuzzyMatchDescription) : item.getDescriptionHighlights();
        const detailHighlights = fuzzyMatchDetail ? this.matchesFuzzy(lookFor, item.getDetail(), fuzzyMatchDetail) : item.getDetailHighlights();
        if ((lookFor && !labelHighlights && !descriptionHighlights && !detailHighlights)
            && !this.options.showItemsWithoutHighlight) {
            return undefined;
        }
        const entry = item instanceof QuickOpenGroupItem
            ? new QuickOpenEntryGroup(item, this.keybindingService)
            : new QuickOpenEntry(item, this.keybindingService);
        entry.setHighlights(labelHighlights || [], descriptionHighlights, detailHighlights);
        return entry;
    }

    protected matchesFuzzy(lookFor: string, value: string | undefined, options?: QuickOpenOptions.FuzzyMatchOptions | boolean): monaco.quickOpen.IHighlight[] | undefined {
        if (!lookFor || !value) {
            return undefined;
        }
        const enableSeparateSubstringMatching = typeof options === 'object' && options.enableSeparateSubstringMatching;
        return monaco.filters.matchesFuzzy(lookFor, value, enableSeparateSubstringMatching);
    }

    getAutoFocus(lookFor: string): monaco.quickOpen.IAutoFocus {
        if (this.options.selectIndex) {
            const idx = this.options.selectIndex(lookFor);
            if (idx >= 0) {
                return {
                    autoFocusIndex: idx
                };
            }
        }
        return {
            autoFocusFirstEntry: true,
            autoFocusPrefixMatch: lookFor
        };
    }

}

export class QuickOpenEntry extends monaco.quickOpen.QuickOpenEntry {

    constructor(
        public readonly item: QuickOpenItem,
        protected readonly keybindingService: TheiaKeybindingService
    ) {
        super();
    }

    getLabel(): string | undefined {
        return this.item.getLabel();
    }

    getAriaLabel(): string | undefined {
        return this.item.getTooltip();
    }

    getDetail(): string | undefined {
        return this.item.getDetail();
    }

    getDescription(): string | undefined {
        return this.item.getDescription();
    }

    isHidden(): boolean {
        return super.isHidden() || this.item.isHidden();
    }

    getResource(): monaco.Uri | undefined {
        const uri = this.item.getUri();
        return uri ? monaco.Uri.parse(uri.toString()) : undefined;
    }

    getIcon(): string | undefined {
        return this.item.getIconClass();
    }

    getKeybinding(): monaco.keybindings.ResolvedKeybinding | undefined {
        const keybinding = this.item.getKeybinding();
        if (!keybinding) {
            return undefined;
        }

        let keySequence: KeySequence;
        try {
            keySequence = this.keybindingService.resolveKeybinding(keybinding);
        } catch (error) {
            return undefined;
        }
        return new TheiaResolvedKeybinding(keySequence, this.keybindingService);
    }

    run(mode: monaco.quickOpen.Mode): boolean {
        if (mode === monaco.quickOpen.Mode.OPEN) {
            return this.item.run(QuickOpenMode.OPEN);
        }
        if (mode === monaco.quickOpen.Mode.OPEN_IN_BACKGROUND) {
            return this.item.run(QuickOpenMode.OPEN_IN_BACKGROUND);
        }
        if (mode === monaco.quickOpen.Mode.PREVIEW) {
            return this.item.run(QuickOpenMode.PREVIEW);
        }
        return false;
    }

}

export class QuickOpenEntryGroup extends monaco.quickOpen.QuickOpenEntryGroup {

    constructor(
        public readonly item: QuickOpenGroupItem,
        protected readonly keybindingService: TheiaKeybindingService
    ) {
        super(new QuickOpenEntry(item, keybindingService));
    }

    getGroupLabel(): string {
        return this.item.getGroupLabel() || '';
    }

    showBorder(): boolean {
        return this.item.showBorder();
    }

    getKeybinding(): monaco.keybindings.ResolvedKeybinding | undefined {
        const entry = this.getEntry();
        return entry ? entry.getKeybinding() : super.getKeybinding();
    }

}

export class MonacoQuickOpenAction implements monaco.quickOpen.IAction {
    constructor(public readonly action: QuickOpenAction) { }

    get id(): string {
        return this.action.id;
    }

    get label(): string {
        return this.action.label || '';
    }

    get tooltip(): string {
        return this.action.tooltip || '';
    }

    get class(): string | undefined {
        return this.action.class;
    }

    get enabled(): boolean {
        return this.action.enabled || true;
    }

    get checked(): boolean {
        return this.action.checked || false;
    }

    get radio(): boolean {
        return this.action.radio || false;
    }

    // tslint:disable-next-line:no-any
    run(entry: QuickOpenEntry | QuickOpenEntryGroup): PromiseLike<any> {
        return this.action.run(entry.item);
    }

    dispose(): void {
        this.action.dispose();
    }
}

export class MonacoQuickOpenActionProvider implements monaco.quickOpen.IActionProvider {
    constructor(public readonly provider: QuickOpenActionProvider) { }

    // tslint:disable-next-line:no-any
    hasActions(element: any, entry: QuickOpenEntry | QuickOpenEntryGroup): boolean {
        return this.provider.hasActions(entry.item);
    }

    // tslint:disable-next-line:no-any
    async getActions(element: any, entry: QuickOpenEntry | QuickOpenEntryGroup): monaco.Promise<monaco.quickOpen.IAction[]> {
        const actions = await this.provider.getActions(entry.item);
        const monacoActions = actions.map(action => new MonacoQuickOpenAction(action));
        return monaco.Promise.wrap(monacoActions);
    }

    hasSecondaryActions(): boolean {
        return false;
    }

    getSecondaryActions(): monaco.Promise<monaco.quickOpen.IAction[]> {
        return monaco.Promise.wrap([]);
    }

    getActionItem() {
        return undefined;
    }
}

interface TheiaKeybindingService {
    resolveKeybinding(binding: ResolvedKeybinding): KeyCode[];
    acceleratorForKey(key: Key): string;
    acceleratorForKeyCode(keyCode: KeyCode, separator?: string): string
    acceleratorForSequence(keySequence: KeySequence, separator?: string): string[];
}

class TheiaResolvedKeybinding extends monaco.keybindings.ResolvedKeybinding {

    protected readonly parts: { key: string | null, modifiers: monaco.keybindings.Modifiers }[];

    constructor(protected readonly keySequence: KeySequence, keybindingService: TheiaKeybindingService) {
        super();
        this.parts = keySequence.map(keyCode => ({
            // tslint:disable-next-line:no-null-keyword
            key: keyCode.key ? keybindingService.acceleratorForKey(keyCode.key) : null,
            modifiers: {
                ctrlKey: keyCode.ctrl,
                shiftKey: keyCode.shift,
                altKey: keyCode.alt,
                metaKey: keyCode.meta
            }
        }));
    }

    private getKeyAndModifiers(index: number) {
        if (index >= this.parts.length) {
            // tslint:disable-next-line:no-null-keyword
            return { key: null, modifiers: null };
        }
        return this.parts[index];
    }

    public getLabel(): string {
        const firstPart = this.getKeyAndModifiers(0);
        const chordPart = this.getKeyAndModifiers(1);
        return monaco.keybindings.UILabelProvider.toLabel(firstPart.modifiers, firstPart.key,
            chordPart.modifiers, chordPart.key, monaco.platform.OS);
    }

    public getAriaLabel(): string {
        const firstPart = this.getKeyAndModifiers(0);
        const chordPart = this.getKeyAndModifiers(1);
        return monaco.keybindings.AriaLabelProvider.toLabel(firstPart.modifiers, firstPart.key,
            chordPart.modifiers, chordPart.key, monaco.platform.OS);
    }

    public getElectronAccelerator(): string {
        const firstPart = this.getKeyAndModifiers(0);
        return monaco.keybindings.ElectronAcceleratorLabelProvider.toLabel(firstPart.modifiers, firstPart.key,
            // tslint:disable-next-line:no-null-keyword
            null, null, monaco.platform.OS);
    }

    public getUserSettingsLabel(): string {
        const firstPart = this.getKeyAndModifiers(0);
        const chordPart = this.getKeyAndModifiers(1);
        return monaco.keybindings.UserSettingsLabelProvider.toLabel(firstPart.modifiers, firstPart.key,
            chordPart.modifiers, chordPart.key, monaco.platform.OS);
    }

    public isWYSIWYG(): boolean {
        return true;
    }

    public isChord(): boolean {
        return this.parts.length >= 2;
    }

    public getDispatchParts(): [string | null, string | null] {
        const firstKeybinding = this.toKeybinding(0)!;
        const firstPart = monaco.keybindings.USLayoutResolvedKeybinding.getDispatchStr(firstKeybinding);
        const chordKeybinding = this.toKeybinding(1);
        // tslint:disable-next-line:no-null-keyword
        const chordPart = chordKeybinding ? monaco.keybindings.USLayoutResolvedKeybinding.getDispatchStr(chordKeybinding) : null;
        return [firstPart, chordPart];
    }

    private toKeybinding(index: number): monaco.keybindings.SimpleKeybinding | null {
        if (index >= this.keySequence.length) {
            // tslint:disable-next-line:no-null-keyword
            return null;
        }
        const keyCode = this.keySequence[index];
        return new monaco.keybindings.SimpleKeybinding(
            keyCode.ctrl,
            keyCode.shift,
            keyCode.alt,
            keyCode.meta,
            KEY_CODE_MAP[keyCode.key!.keyCode]
        );
    }

    public getParts(): [monaco.keybindings.ResolvedKeybindingPart | null, monaco.keybindings.ResolvedKeybindingPart | null] {
        return [
            this.toResolvedKeybindingPart(0),
            this.toResolvedKeybindingPart(1)
        ];
    }

    private toResolvedKeybindingPart(index: number): monaco.keybindings.ResolvedKeybindingPart | null {
        if (index >= this.parts.length) {
            // tslint:disable-next-line:no-null-keyword
            return null;
        }
        const part = this.parts[index];
        return new monaco.keybindings.ResolvedKeybindingPart(
            part.modifiers.ctrlKey,
            part.modifiers.shiftKey,
            part.modifiers.altKey,
            part.modifiers.metaKey,
            part.key!,
            part.key!
        );
    }

}
