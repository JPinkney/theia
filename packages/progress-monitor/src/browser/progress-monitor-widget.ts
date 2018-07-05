/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
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

import { injectable, postConstruct, inject } from "inversify";
import { Panel } from "@theia/core/lib/browser";
import { ProgressMonitorManager } from "./progress-monitor-manager";

export const PROGRESS_MONITOR_WIDGET_KIND = 'progressMonitorView';

@injectable()
export class ProgressMonitorWidget extends Panel {

    constructor(@inject(ProgressMonitorManager) protected readonly progressMonitorManager: ProgressMonitorManager) {
        super();
        this.id = PROGRESS_MONITOR_WIDGET_KIND;
        this.title.label = 'Progress Monitor';
        this.title.iconClass = 'fa fa-spinner';
        this.title.closable = true;
        this.addClass('theia-progress-monitor');
    }

    @postConstruct()
    protected init(): void {
        this.progressMonitorManager.onProgressItemAdded(item => {
            // Display the item
            this.addWidget(item);
        });
        this.progressMonitorManager.onProgressItemDelete(item => {
            // Remove the item

        });
    }
}
