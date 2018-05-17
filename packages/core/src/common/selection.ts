/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import URI from './uri';

export interface UriSelection {
    readonly uri: URI
}

export namespace UriSelection {

    export function is(arg: Object | undefined): arg is UriSelection {
        // tslint:disable-next-line:no-any
        return typeof arg === 'object' && ('uri' in arg) && (<any>arg)['uri'] instanceof URI;
    }

    export type Composite = CompositeSelection<UriSelection>;
    export function isComposite(arg: Object | undefined): arg is Composite {
        return CompositeSelection.is(arg, is);
    }

    export function getUri(selection: Object | undefined): URI | undefined {
        if (is(selection)) {
            return selection.uri;
        }
        if (isComposite(selection)) {
            return getUri(selection.selectedElements[0]);
        }
        return undefined;
    }
    export function getUris(selection: Object | undefined): URI[] {
        if (is(selection)) {
            return [selection.uri];
        }
        if (isComposite(selection)) {
            return selection.selectedElements.map(s => s.uri);
        }
        return [];
    }

}

export interface CompositeSelection<T> {
    readonly selectedElements: T[]
}
export namespace CompositeSelection {
    export function is<T>(arg: Object | undefined, isElement: (arg: Object | undefined) => arg is T): arg is CompositeSelection<T> {
        if (typeof arg === 'object' && 'selectedElements' in arg) {
            const selection = arg as CompositeSelection<Object>;
            return selection.selectedElements.length === 0 || isElement(selection.selectedElements[0]);
        }
        return false;
    }
}
