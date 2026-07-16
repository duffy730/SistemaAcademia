using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarProdutoEQuantidadeEmPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProdutoId",
                table: "Pagamentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantidade",
                table: "Pagamentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ProdutoId",
                table: "Pagamentos",
                column: "ProdutoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Produtos_ProdutoId",
                table: "Pagamentos",
                column: "ProdutoId",
                principalTable: "Produtos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Produtos_ProdutoId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ProdutoId",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "ProdutoId",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "Quantidade",
                table: "Pagamentos");
        }
    }
}
