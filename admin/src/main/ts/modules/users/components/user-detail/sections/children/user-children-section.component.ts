import { Component, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { AbstractSection } from '../abstract.section'
import { UserListService, LoadingService } from '../../../../../../services'
import { UserModel } from '../../../../../../store'

@Component({
    selector: 'user-children-section',
    template: `
        <panel-section section-title="users.details.section.children" [folded]="true" *ngIf="isRelative(user)">
            <button (click)="showChildrenLightbox = true">
                <s5l>add.child</s5l><i class="fa fa-plus-circle"></i>
            </button>
            <light-box class="inner-list"
                    [show]="showChildrenLightbox" (onClose)="showChildrenLightbox = false">
                <div class="padded">
                    <h3><s5l>add.child</s5l></h3>
                    <list-component class="inner-list"
                        [model]="structure?.users?.data"
                        [inputFilter]="userListService.filterByInput"
                        [filters]="filterChildren"
                        searchPlaceholder="search.user"
                        [sort]="userListService.sorts"
                        [display]="userListService.display"
                        (inputChange)="userListService.inputFilter = $event"
                        [isDisabled]="disableChild"
                        (onSelect)="ls.perform($event.id, details?.addChild($event), 0)">
                    </list-component>
                </div>
            </light-box>
            <ul class="actions-list">
                <li *ngFor="let child of details?.children">
                    <a class="action" [routerLink]="['..', child.id]">
                        {{ child.lastName | uppercase }} {{ child.firstName }}
                    </a>
                    <i  class="fa fa-times action" (click)="ls.perform(child.id, details?.removeChild(child), 0)"
                        [tooltip]="'delete.this.child' | translate"
                        [ngClass]="{ disabled: ls.isLoading(child.id)}"></i>
                </li>
            </ul>
        </panel-section>
    `,
    inputs: ['user', 'structure'],
    providers: [ UserListService ]
})
export class UserChildrenSection extends AbstractSection {

    constructor(
            private userListService: UserListService,
            protected ls: LoadingService,
            protected cdRef: ChangeDetectorRef) {
        super()
    }

    @ViewChild("codeInput") codeInput : AbstractControl

    protected onUserChange(){}

    private isRelative(u: UserModel){
        return u.type === 'Relative'
    }

    private filterChildren = (u: UserModel) => {
        return this.details && this.details.children &&
            u.type === 'Student' && !this.details.children.find(c => c.id === u.id)
    }

    private disableChild = (child) => {
        return this.ls.isLoading(child.id)
    }

}