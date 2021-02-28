import { Request, Response } from "express";
import { getCustomRepository, IsNull, Not } from "typeorm";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveyUserRepository = getCustomRepository(SurveyUserRepository);

    const surveyUser = await surveyUserRepository.find({
      survey_id,
      value: Not(IsNull()),
    });

    const detractor = surveyUser.filter(
      (survey) => survey.value >= 0 && survey.value <= 6
    ).length;
    const promoters = surveyUser.filter(
      (survey) => survey.value >= 9 && survey.value <= 10
    ).length;
    const passive = surveyUser.filter(
      (survey) => survey.value >= 7 && survey.value <= 8
    ).length;

    const totalAnswer = surveyUser.length;

    const calculate = Number(
      (((promoters - detractor) / totalAnswer) * 100).toFixed(2)
    );

    return response.json({
      detractor,
      promoters,
      passive,
      totalAnswer,
      nps: calculate,
    });
  }
}

export { NpsController };
