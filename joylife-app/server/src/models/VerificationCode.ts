import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface IVerificationCodeAttributes {
  id: number;
  phone?: string;
  email?: string;
  code: string;
  type: 'register' | 'login' | 'reset_password';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

interface IVerificationCodeCreationAttributes
  extends Optional<IVerificationCodeAttributes, 'id' | 'createdAt'> {}

class VerificationCode
  extends Model<IVerificationCodeAttributes, IVerificationCodeCreationAttributes>
  implements IVerificationCodeAttributes
{
  public id!: number;
  public phone?: string;
  public email?: string;
  public code!: string;
  public type!: 'register' | 'login' | 'reset_password';
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
}

VerificationCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('register', 'login', 'reset_password'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'verification_codes',
    modelName: 'VerificationCode',
    indexes: [
      {
        fields: ['phone', 'code', 'type'],
      },
      {
        fields: ['email', 'code', 'type'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default VerificationCode;
