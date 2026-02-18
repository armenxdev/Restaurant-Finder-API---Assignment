import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../client/db.sequelize.js";

class User extends Model {
    comparePassword(plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        profilePicture: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null
        },

        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: "users_username_unique",
            validate: {
                len: [3, 100]
            }
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: "users_username_unique",
            validate: {
                isEmail: true
            }
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [6, 255]
            }
        }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

export default User;
