import { Body, Controller ,Get,Param, ParseIntPipe, Post,Patch,Delete} from '@nestjs/common';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { Public, Roles } from '../auth/roles.js';
@Controller('books')
export class BooksController {
    constructor(private readonly booksService :BooksService){}
    @Public()
    @Get('')
    findAll(){
        return this.booksService.findAll();
    }
    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id:number){
         return this.booksService.findOne(id);
    }
    @Roles('ADMIN', 'LIBRARIAN')
    @Post('')
    create(@Body() dto:CreateBookDto){
        return this.booksService.create(dto);
    }
    @Roles('ADMIN', 'LIBRARIAN')
    @Patch(':id')
        update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
         return this.booksService.update(id, dto);
    }
    @Roles('ADMIN', 'LIBRARIAN')
    @Delete(':id')
        remove(@Param('id', ParseIntPipe) id: number) {
        return this.booksService.remove(id);
    }
}
