using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class CorrigirTiposAluno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Alunos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Cpf",
                table: "Alunos",
                type: "nvarchar(14)",
                maxLength: 14,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Telefone",
                table: "Alunos",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<int>(
                name: "Cpf",
                table: "Alunos",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(14)",
                oldMaxLength: 14);
        }
    }
}
