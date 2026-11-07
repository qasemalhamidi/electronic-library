import { Controller, Get, Param ,ParseIntPipe ,Post,Body,Patch,Delete} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { Roles } from '../auth/roles.js';

@Roles('ADMIN', 'LIBRARIAN')
@Controller('members')
export class MembersController {

    constructor(private readonly memberService :MembersService){}

    @Get()
    findAll(){
        return this.memberService.findAll();
    }
    @Get(':id')
    findOne(@Param('id',ParseIntPipe )id:number ){
        return this.memberService.findOne(id);
    }
    @Post('')
    create(@Body() dto:CreateMemberDto){
        return this.memberService.create(dto);
    }
    @Patch(':id')
            update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
             return this.memberService.update(id, dto);
    }
    
    @Delete(':id')
            remove(@Param('id', ParseIntPipe) id: number) {
            return this.memberService.remove(id);
    }
}

