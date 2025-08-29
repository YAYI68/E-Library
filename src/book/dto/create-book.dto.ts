import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateBookDto {
@IsString()
@IsNotEmpty()
title: string;


@IsString()
@IsNotEmpty()
author: string;

@Min(1)
@IsNumber()
available_copies: number;
}