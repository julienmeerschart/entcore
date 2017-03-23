import { Input, ViewChild, ChangeDetectorRef } from '@angular/core'
import { UserDetailsModel, StructureModel, globalStore, UserModel } from '../../../../../store'
import { LoadingService } from '../../../../../services'

export abstract class AbstractSection {

    constructor(){}

    get user(){ return this._user }
    set user(u: UserModel){
        this.onUserChange()
        this._user = u
        this.details = u.userDetails
    }
    protected _user : UserModel
    protected details: UserDetailsModel
    structure: StructureModel

    protected now : string = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    protected emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    protected getStructure(id: string) {
        return globalStore.structures.data.find(s => s.id === id)
    }

    protected abstract onUserChange()

}