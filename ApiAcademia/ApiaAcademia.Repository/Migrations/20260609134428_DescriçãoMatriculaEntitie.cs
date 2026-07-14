using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class DescriçãoMatriculaEntitie : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Matriculas",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Matriculas");
        }
    }
}
