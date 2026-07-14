using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class PlanoIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matriculas_Planos_PlanoId",
                table: "Matriculas");

            migrationBuilder.AlterColumn<int>(
                name: "PlanoId",
                table: "Matriculas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Matriculas_Planos_PlanoId",
                table: "Matriculas",
                column: "PlanoId",
                principalTable: "Planos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matriculas_Planos_PlanoId",
                table: "Matriculas");

            migrationBuilder.AlterColumn<int>(
                name: "PlanoId",
                table: "Matriculas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Matriculas_Planos_PlanoId",
                table: "Matriculas",
                column: "PlanoId",
                principalTable: "Planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
