import mongoose, { Schema } from "mongoose";

const userSchema: Schema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    user_id: {type: String, required: true},
    email_address: {type: String, required: true},
    wallet_address: {type: String, required: false},
    country: {type: String, required: false},
    role: {type: String, default: "user"}  // Admin, superuser, user
})

const requestDoxxerSchema: Schema = new Schema({
    id: {type: String, required:true},
    reason: {type: String, required: true},
    github: {type: String, required: true},
    cv: {type: String, required:true},
    status: {type: String, required:true}
})

const verifySchema: Schema = new Schema({
    amount_of_team_members: {type: Number, required: true},
    chain: {type: String, required: true},
    co_founders_image: {type: String, default: ""},
    contract_address: {type: String, required: true},
    created_on: {type: Date, required: true},
    deployer_address: {type: String, required: true},
    founders_image: {type: String, required: true},
    is_Audited: {type: Boolean, require: true},
    name_of_project: {type: String, required: true},
    screenshot_of_your_website: {type: String},
    twitter_profile_link: {type: String, required: true},
    website_link: {type: String, default: ""},
    whitepaper: {type: String, required: true},
    status: {type: String, default: "pending"},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
})

//compiling our model

 export const Verify = mongoose.model('Verify', verifySchema)
 export const User = mongoose.model('User', userSchema)
 export const RequestDoxxer = mongoose.model('requestDoxxer',requestDoxxerSchema)

