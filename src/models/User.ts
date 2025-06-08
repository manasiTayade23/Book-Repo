import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { sequelize } from '../config/database';
import config from '../config/env';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    getSignedJwtToken(): string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const User = sequelize.define<UserInstance>(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [3, 30],
                    msg: 'Username must be between 3 and 30 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Please provide a valid email'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [6, 100],
                    msg: 'Password must be at least 6 characters long'
                }
            }
        }
    },
    {
        timestamps: true,
        hooks: {
            beforeCreate: async (user: UserInstance) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user: UserInstance) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
);

const instanceMethods = {
    getSignedJwtToken(this: UserInstance): string {
        const options: SignOptions = {
            expiresIn: '24h'
        };
        return jwt.sign({ id: this.id }, config.JWT_SECRET || 'secret', options);
    },
    async matchPassword(this: UserInstance, enteredPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, this.password);
    }
};

Object.assign(User.prototype, instanceMethods);

export default User; 