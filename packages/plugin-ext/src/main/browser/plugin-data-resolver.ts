/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
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

import { PluginDataExtractor } from './plugin-data-extractor';
import { injectable, inject } from 'inversify';

/**
 * This class takes a request from a language and converts to it success or failure.
 * From there, the plugin data extractor mines the information
 */
@injectable()
export class PluginDataResolver {

    private dataMiner: PluginDataExtractor;

    constructor(@inject(PluginDataExtractor) dataMiner: PluginDataExtractor) {
        this.dataMiner = dataMiner;
    }

    // tslint:disable-next-line:no-any
    async fireRequestMetric(a: PromiseLike<any> | Promise<any>): Promise<any> {
        if (isPromise(a)) {
            await a.then(() => this.dataMiner.mine(true), () => this.dataMiner.mine(false));
            return a;
        } else if (isPromiseLike(a)) {
            await a.then(() => this.dataMiner.mine(true), () => this.dataMiner.mine(false));
            return a;
        } else {
            this.dataMiner.mine(true);
            return a;
        }
    }

}

// tslint:disable-next-line:no-any
function isPromise(a: any): a is Promise<any> {
    // tslint:disable-next-line:no-any
    return (<Promise<any>>a).then !== undefined;
}

// tslint:disable-next-line:no-any
function isPromiseLike(a: any): a is PromiseLike<any> {
    // tslint:disable-next-line:no-any
    return (<PromiseLike<any>>a).then !== undefined;
}
