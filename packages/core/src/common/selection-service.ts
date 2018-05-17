/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { Emitter, Event } from '../common/event';
import { Disposable, DisposableCollection } from '../common/disposable';

// tslint:disable:no-any

export interface SelectionProvider<T> {
    onSelectionChanged: Event<T | undefined>;
}

@injectable()
export class SelectionService implements SelectionProvider<Object | undefined> {

    private currentSelection: Object | undefined;

    protected readonly onSelectionChangedEmitter = new Emitter<any>();
    readonly onSelectionChanged: Event<any> = this.onSelectionChangedEmitter.event;

    get selection(): Object | undefined {
        return this.currentSelection;
    }

    protected readonly toDisposeOnSelection = new DisposableCollection();
    set selection(selection: Object | undefined) {
        this.toDisposeOnSelection.dispose();
        this.currentSelection = selection;
        if (Disposable.is(selection)) {
            const disposeSelection = selection.dispose;
            selection.dispose = () => {
                this.selection = undefined;
                disposeSelection.bind(selection)();
            };
            this.toDisposeOnSelection.push(Disposable.create(() => selection.dispose = disposeSelection));
        }
        this.onSelectionChangedEmitter.fire(this.currentSelection);
    }

}
