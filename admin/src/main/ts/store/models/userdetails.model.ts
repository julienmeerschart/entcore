import { Model } from 'toolkit'
import { Group } from '../../store'

export class UserDetailsModel extends Model<UserDetailsModel> {

    constructor() {
        super({
            sync: '/directory/user/:id',
            update: '/directory/user/:id'
        })
    }

    id?: string
    activationCode?: string
    firstName?: string
    lastName?: string
    displayName?: string
    externalId?: string
    source?: string
    email?: string
    birthDate?: string
    oldemail?: string
    login?: string
    blocked?: boolean
    zipCode: string
    city: string
    address: string
    homePhone: string
    mobile?: string
    profiles?: Array<string>
    type?: Array<string>
    functions?: Array<[string, Array<string>]>
    children?: Array<{id: string, firstName: string, lastName: string, displayName: string, externalId: string}>
    parents?: Array<{id: string, firstName: string, lastName: string, displayName: string, externalId: string}>
    functionalGroups?: Array<string>
    manualGroups?: Group[]
    administrativeStructures?: Array<string>
    deleteDate?: number

    toggleBlock() {
        return this.http.put(`/auth/block/${this.id}`, { block: !this.blocked }).then(() => {
            this.blocked = !this.blocked
        })
    }

    sendResetPassword(email: string) {
        let payload = new window['URLSearchParams']()
        payload.append('login', this.login)
        payload.append('email', email);
        return this.http.post('/auth/sendResetPassword', payload)
    }

    addRelative(parent) {
        return this.http.put(`/directory/user/${this.id}/related/${parent.id}`).then(() => {
            this.parents.push(parent)
        })
    }

    removeRelative(parent) {
        return this.http.delete(`/directory/user/${this.id}/related/${parent.id}`).then(() => {
            this.parents = this.parents.filter(p => p.id !== parent.id)
        })
    }

    addChild(child) {
        return this.http.put(`/directory/user/${child.id}/related/${this.id}`).then(() => {
            this.children.push(child)
        })
    }

    removeChild(child) {
        return this.http.delete(`/directory/user/${child.id}/related/${this.id}`).then(() => {
            this.children = this.children.filter(c => c.id !== child.id)
        })
    }

    addManualGroup(mgroup: Group) {
        return this.http.post(`/directory/user/group/${this.id}/${mgroup.id}`, {}).then(() => {
            this.manualGroups.push(mgroup)
        })
    }

    removeManualGroup(mgroup: Group) {
        return this.http.delete(`/directory/user/group/${this.id}/${mgroup.id}`).then(() => {
            this.manualGroups = this.manualGroups.filter(g => mgroup.id !== g.id)
        })
    }

    toJSON() {
        return {
            firstName:      this.firstName,
            lastName:       this.lastName,
            displayName:    this.displayName,
            birthDate:      this.birthDate,
            address:        this.address,
            city:           this.city,
            zipCode:        this.zipCode,
            email:          this.email,
            homePhone:      this.homePhone,
            mobile:         this.mobile
        }
    }
}