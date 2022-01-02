export interface BaseUser {
    firstName: string
    lastName: string
    email: string
    password:  string
    phone?:     string | null
    address?:   string | null
    city?:      string | null
    zipCode?:   string | null

}

export interface User extends BaseUser {
    statusId: number
    id: number
    token?: string
    refreshToken?: string
}

export interface RefreshToken {
    userEmail: string
    token: string
}