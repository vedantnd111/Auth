// defining mongoose schema to perform backend operations
const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        maxlength: 20,
        required: true
    },
    hashed_password: {
        type: String,
        required: true,
        unique: true
    },
    salt: String
});

userSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = uuidv4();
        this.hashed_password = this.encryptPassword(password);

    })
    .get(function () {
        return this._password
    });


userSchema.methods = {

    authanticate: function (plainPassword) {

        return this.encryptPassword(plainPassword) === this.hashed_password;
    },

    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest("hex");
        }
        catch {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);