import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendEmailService from "../service/SendEmailService";
import { resolve } from "path";
import { AppError } from "../errors/AppError";

class SendEmailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveyRepository = getCustomRepository(SurveysRepository);
    const surveyUserRepository = getCustomRepository(SurveyUserRepository);

    const userAlreadyExists = await usersRepository.findOne({ email });

    if (!userAlreadyExists) {
      throw new AppError("User does not exists");
    }

    const surveyAlreadyExists = await surveyRepository.findOne({
      id: survey_id,
    });

    if (!surveyAlreadyExists) {
      throw new AppError("Survey does not exists");
    }

    const surveyUserAlreadyExists = await surveyUserRepository.findOne({
      where: [
        { user_id: userAlreadyExists.id, survey_id: surveyAlreadyExists.id },
      ],
      relations: ["user", "survey"],
    });

    if (surveyUserAlreadyExists.value !== null) {
      return response.json(surveyUserAlreadyExists);
    }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsEmail.hbs");

    const surveyUser = surveyUserRepository.create({
      user_id: userAlreadyExists.id,
      survey_id,
    });

    const variables = {
      name: userAlreadyExists.name,
      title: surveyAlreadyExists.title,
      description: surveyAlreadyExists.description,
      id: "",
      link: process.env.URL_EMAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendEmailService.execute(
        email,
        surveyAlreadyExists.title,
        variables,
        npsPath
      );
      return response.json(surveyUserAlreadyExists);
    }

    await surveyUserRepository.save(surveyUser);

    variables.id = surveyUserAlreadyExists.id;

    await SendEmailService.execute(
      email,
      surveyAlreadyExists.title,
      variables,
      npsPath
    );
    return response.status(201).json(surveyUser);
  }
}

export { SendEmailController };
