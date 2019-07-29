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

import { inject, injectable } from 'inversify';
import { PluginMetrics } from '../../common';

// Purpose of this class is to mine the plugin metrics for data we want
@injectable()
export class PluginDataExtractor {

    private pluginMetrics: PluginMetrics;

    constructor(@inject(PluginMetrics) pluginMetrics: PluginMetrics) {
        this.pluginMetrics = pluginMetrics;
    }

    private totalRequests = 0;
    private successfulResponses = 0;

    async mine(isRequestSuccessful: boolean): Promise<void> {
        this.totalRequests += 1;
        if (isRequestSuccessful) {
            this.successfulResponses += 1;
        }
        this.pluginMetrics.setMetrics(`The percentage of successful requests is: ${(this.successfulResponses / this.totalRequests) * 100}%`);
    }

}
