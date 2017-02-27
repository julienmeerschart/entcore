import { Subscription } from 'rxjs/Subscription'
import { Group } from '../../../../store/mappings'
import { ActivatedRoute, Router } from '@angular/router'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { GroupsDataService } from '../../services/groups.data.service'
import { LoadingService } from '../../../../services'

@Component({
    selector: 'groups-type-view',
    template: `
        <side-layout (closeCompanion)="closePanel()" [showCompanion]="!router.isActive(rootRoute(), true)">
            <div side-card>
                <list-component
                    [model]="dataService.structure?.groups.data"
                    [filters]="{type: groupType}"
                    [inputFilter]="filterByInput"
                    sort="name"
                    searchPlaceholder="search.group"
                    [isSelected]="isSelected"
                    [display]="display"
                    (inputChange)="groupInputFilter = $event"
                    (onSelect)="routeToGroup($event)">
                </list-component>
            </div>
            <div side-companion>
                <router-outlet></router-outlet>
            </div>
        </side-layout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsTypeView implements OnInit, OnDestroy {

    private groupType : string
    private typeSubscriber : Subscription
    private dataSubscriber : Subscription

    constructor(
        private dataService: GroupsDataService,
        private route: ActivatedRoute,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private ls: LoadingService) {}

    ngOnInit() {
        this.typeSubscriber = this.route.params.subscribe(params => {
            let type = params["groupType"]
            let allowedTypes = ["manual", "profile", "functional"]
            if(type && allowedTypes.indexOf(type) >= 0) {
                this.groupType = params["groupType"]
                this.cdRef.markForCheck()
            } else {
                this.router.navigate([".."], { relativeTo: this.route })
            }
        })
        this.dataSubscriber = this.dataService.onchange.subscribe(field => {
            if(field === "structure"){
                this.cdRef.markForCheck()
                this.cdRef.detectChanges()
            }
        })
    }
    ngOnDestroy() {
        this.dataSubscriber.unsubscribe()
        this.typeSubscriber.unsubscribe()
    }

    // List component  properties
    private groupInputFilter : string
    private isSelected = (group: Group) => {
        return this.dataService.group === group
    }
    private filterByInput = (group: Group) => {
        if(!this.groupInputFilter) return true
        return group.name.toLowerCase()
            .indexOf(this.groupInputFilter.toLowerCase()) >= 0
    }
    private display = (group: Group) => { return group.name }

    // Routing
    private rootRoute = () => {
        return '/admin/' + (this.dataService.structure ? this.dataService.structure.id : '') +
        '/groups/' + this.groupType
    }
    private closePanel() {
        this.router.navigateByUrl(this.rootRoute())
    }
    private routeToGroup(g:Group) {
        this.router.navigate([g.id], { relativeTo: this.route })
    }
}