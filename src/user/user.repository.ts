import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { User } from "./entities/user.entity";
import { RegisterDto } from "src/auth/dto/auth.dto";




@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userModel: Repository<User>,
  ) {}
  create(dto:RegisterDto){
    const user = this.userModel.create({
       ...dto
    });
    return this.userModel.save(user);
  }

  findByUsername(username: string){
    return this.userModel.findOne({where:{
        username
    }})
  }

  findById(id: number){
    return this.userModel.findOneBy({id})
  }

  findByEmail(email: string){
    return this.userModel.findOne({where:{
        email
    }})
  }



}