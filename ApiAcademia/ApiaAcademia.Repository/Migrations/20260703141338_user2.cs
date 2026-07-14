using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class user2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "User",
                table: "Usuarios",
                newName: "Usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Usuario",
                table: "Usuarios",
                newName: "User");
        }
    }
}
