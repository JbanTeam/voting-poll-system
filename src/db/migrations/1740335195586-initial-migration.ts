import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1740335195586 implements MigrationInterface {
    name = 'InitialMigration1740335195586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answer" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "question_id" integer, CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "poll_id" integer, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."poll_status_enum" AS ENUM('ACTIVE', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "poll" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "closedAt" TIMESTAMP, "status" "public"."poll_status_enum" NOT NULL DEFAULT 'ACTIVE', "authorId" integer, CONSTRAINT "PK_03b5cf19a7f562b231c3458527e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "refreshToken" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_answer" ("id" SERIAL NOT NULL, "user_id" integer, "poll_id" integer, "question_id" integer, "answer_id" integer, CONSTRAINT "PK_37b32f666e59572775b1b020fb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "poll_statistics" ("id" SERIAL NOT NULL, "count" integer NOT NULL DEFAULT '0', "poll_id" integer, "answer_id" integer, "question_id" integer, CONSTRAINT "PK_66c3380a844abc23578c4a8b3fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_812f71b12645fca057de19a3efa" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_a1fddeb1242e06fb38de24cec7c" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_f28b638e98374b7ce00a7f19d26" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_47c6aa0127b5b8e9442b9e36c98" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_statistics" ADD CONSTRAINT "FK_98a020788fc8e6f2ae434639f86" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_statistics" ADD CONSTRAINT "FK_d25b4763de5dccae3957bead408" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_statistics" ADD CONSTRAINT "FK_ae2889d4ab9deccae0a65582e8b" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "poll_statistics" DROP CONSTRAINT "FK_ae2889d4ab9deccae0a65582e8b"`);
        await queryRunner.query(`ALTER TABLE "poll_statistics" DROP CONSTRAINT "FK_d25b4763de5dccae3957bead408"`);
        await queryRunner.query(`ALTER TABLE "poll_statistics" DROP CONSTRAINT "FK_98a020788fc8e6f2ae434639f86"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_47c6aa0127b5b8e9442b9e36c98"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_f28b638e98374b7ce00a7f19d26"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_a1fddeb1242e06fb38de24cec7c"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_812f71b12645fca057de19a3efa"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`);
        await queryRunner.query(`DROP TABLE "poll_statistics"`);
        await queryRunner.query(`DROP TABLE "user_answer"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "poll"`);
        await queryRunner.query(`DROP TYPE "public"."poll_status_enum"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "answer"`);
    }

}
