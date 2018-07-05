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

import * as React from "react";
import { ProgressReport } from "./progress-monitor-impl";
import { ReactWidget } from "@theia/core/lib/browser/widgets/react-widget";

export const PROGRESS_MONITOR_WIDGET_KIND = 'progressMonitorView';

/**
 * This class is going to be the base of all the status bars
 */
export class ProgressMonitorItem extends ReactWidget {

    private monitor: ProgressReport;

    private style = {
        width: this.monitor.workDone / this.monitor.totalWork + '%',
        height: '50px',
    };

    constructor(monitor: ProgressReport) {
        super();
        this.monitor = monitor;
    }

    protected render(): React.ReactNode {
        return (
            <div className="theia-progress-monitor-item">
                <h6>{this.monitor.id}</h6>
                <div style={this.style}>
                </div>
                <h4>{this.monitor.status}</h4>
            </div>
        );
    }

    public updateProgress(monitor: ProgressReport) {
        this.monitor = monitor;
        this.update();
    }

}
