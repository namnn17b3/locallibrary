import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration011710383100479 implements MigrationInterface {
    name = 'Gration011710383100479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`author\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`family_name\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`lifespan\` varchar(100) NULL, \`date_of_birth\` date NULL, \`date_of_death\` date NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_instance\` (\`id\` int NOT NULL AUTO_INCREMENT, \`imprint\` varchar(255) NOT NULL, \`status\` enum ('Available', 'Maintenance', 'On Loan', 'Reserved') NOT NULL, \`dueBack\` date NOT NULL, \`bookId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`summary\` text NOT NULL, \`ISBN\` varchar(255) NOT NULL, \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`bookId\` int NULL, \`genreId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_instance\` ADD CONSTRAINT \`FK_0ae696d2366c8a89f5bc0d90181\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book\` ADD CONSTRAINT \`FK_66a4f0f47943a0d99c16ecf90b2\` FOREIGN KEY (\`authorId\`) REFERENCES \`author\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_genre\` ADD CONSTRAINT \`FK_d3446a42df5e6f8158a5bd10f1a\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_genre\` ADD CONSTRAINT \`FK_564b744154ba1b5bc35e851f8bc\` FOREIGN KEY (\`genreId\`) REFERENCES \`genre\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_genre\` DROP FOREIGN KEY \`FK_564b744154ba1b5bc35e851f8bc\``);
        await queryRunner.query(`ALTER TABLE \`book_genre\` DROP FOREIGN KEY \`FK_d3446a42df5e6f8158a5bd10f1a\``);
        await queryRunner.query(`ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_66a4f0f47943a0d99c16ecf90b2\``);
        await queryRunner.query(`ALTER TABLE \`book_instance\` DROP FOREIGN KEY \`FK_0ae696d2366c8a89f5bc0d90181\``);
        await queryRunner.query(`DROP TABLE \`genre\``);
        await queryRunner.query(`DROP TABLE \`book_genre\``);
        await queryRunner.query(`DROP TABLE \`book\``);
        await queryRunner.query(`DROP TABLE \`book_instance\``);
        await queryRunner.query(`DROP TABLE \`author\``);
    }

}
