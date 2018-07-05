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

import { Emitter } from "@theia/core";
import { injectable } from "inversify";
import { ProgressMonitorItem } from "../browser/progress-monitor-item";
import { ProgressReport } from "./progress-monitor-impl";

@injectable()
export class ProgressMonitorManager {
    private progressItems = new Map<string, ProgressMonitorItem>();

    private readonly progressItemDeleteEmitter = new Emitter<{ id: string }>();
    private readonly progressItemAddedEmitter = new Emitter<ProgressMonitorItem>();
    readonly onProgressItemDelete = this.progressItemDeleteEmitter.event;
    readonly onProgressItemAdded = this.progressItemAddedEmitter.event;
    readonly onProgressItemUpdated = this.progressItemAddedEmitter.event;

    getProgressMonitorItem(id: string): ProgressMonitorItem | undefined {
        return this.progressItems.get(id);
    }

    deleteProgressMonitorItem(id: string): void {
        this.progressItems.delete(id);
        this.progressItemDeleteEmitter.fire({ id: id });
    }

    createProgressMonitorItem(monitor: ProgressReport): ProgressMonitorItem {
        const exists = this.getProgressMonitorItem(monitor.id);
        if (exists) {
            exists.updateProgress(monitor);
            return exists;
        }
        const progressMonitorItem = new ProgressMonitorItem(monitor);
        this.progressItems.set(monitor.id, progressMonitorItem);
        this.progressItemAddedEmitter.fire(progressMonitorItem);
        return progressMonitorItem;
    }

    getProgressMonitorItems(): ProgressMonitorItem[] {
        return Array.from(this.progressItems.values());
    }
}
