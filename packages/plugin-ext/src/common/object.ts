/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// copied from https://github.com/microsoft/vscode/blob/master/src/vs/base/common/objects.ts
// with small modifications

// tslint:disable-next-line:no-any
export function cloneAndChange(obj: any, changer: (orig: any) => any): any {
    return _cloneAndChange(obj, changer, new Set());
}

// tslint:disable-next-line:no-any
function _cloneAndChange(obj: any, changer: (orig: any) => any, seen: Set<any>): any {
    if (isUndefinedOrNull(obj)) {
        return obj;
    }

    const changed = changer(obj);
    if (typeof changed !== 'undefined') {
        return changed;
    }

    if (isArray(obj)) {
        // tslint:disable-next-line:no-any
        const r1: any[] = [];
        for (const e of obj) {
            r1.push(_cloneAndChange(e, changer, seen));
        }
        return r1;
    }

    if (isObject(obj)) {
        if (seen.has(obj)) {
            throw new Error('Cannot clone recursive data-structure');
        }
        seen.add(obj);
        const r2 = {};
        for (const i2 in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i2)) {
                // tslint:disable-next-line:no-any
                (r2 as any)[i2] = _cloneAndChange(obj[i2], changer, seen);
            }
        }
        seen.delete(obj);
        return r2;
    }

    return obj;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// copied from https://github.com/microsoft/vscode/blob/master/src/vs/base/common/types.ts
// with small modifications

const _typeof = {
    number: 'number',
    string: 'string',
    undefined: 'undefined',
    object: 'object',
    function: 'function'
};

/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
// tslint:disable-next-line:no-any
export function isArray(array: any): array is any[] {
    if (Array.isArray) {
        return Array.isArray(array);
    }

    if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
        return true;
    }

    return false;
}

/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 * `null`, an `array`, a `regexp`, nor a `date`.
 */
// tslint:disable-next-line:no-any
export function isObject(obj: any): obj is Object {
    // The method can't do a type cast since there are type (like strings) which
    // are subclasses of any put not positvely matched by the function. Hence type
    // narrowing results in wrong results.
    return typeof obj === _typeof.object
        && obj !== null
        && !Array.isArray(obj)
        && !(obj instanceof RegExp)
        && !(obj instanceof Date);
}

/**
 * @returns whether the provided parameter is undefined.
 */
// tslint:disable-next-line:no-any
export function isUndefined(obj: any): obj is undefined {
    return typeof (obj) === _typeof.undefined;
}

/**
 * @returns whether the provided parameter is undefined or null.
 */
// tslint:disable-next-line:no-any
export function isUndefinedOrNull(obj: any): obj is undefined | null {
    return isUndefined(obj) || obj === null;
}



