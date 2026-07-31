using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class Cpf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Cpf",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Telefone",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Telefone",
                table: "Alunos");
        }
    }
}
