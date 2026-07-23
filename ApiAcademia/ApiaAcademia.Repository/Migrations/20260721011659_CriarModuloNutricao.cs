using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAcademia.Repository.Migrations
{
    /// <inheritdoc />
    public partial class CriarModuloNutricao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlanosNutricao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CaloriasMeta = table.Column<int>(type: "int", nullable: false),
                    ProteinasMeta = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CarboidratosMeta = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    GordurasMeta = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    AguaMetaLitros = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanosNutricao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanosNutricao_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedidasCorporais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanoNutricaoId = table.Column<int>(type: "int", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Cintura = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Braco = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Peito = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedidasCorporais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedidasCorporais_PlanosNutricao_PlanoNutricaoId",
                        column: x => x.PlanoNutricaoId,
                        principalTable: "PlanosNutricao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefeicoesNutricao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanoNutricaoId = table.Column<int>(type: "int", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Horario = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Alimentos = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Quantidades = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Calorias = table.Column<int>(type: "int", nullable: false),
                    Ordem = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefeicoesNutricao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefeicoesNutricao_PlanosNutricao_PlanoNutricaoId",
                        column: x => x.PlanoNutricaoId,
                        principalTable: "PlanosNutricao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SuplementosNutricao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanoNutricaoId = table.Column<int>(type: "int", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Dosagem = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuplementosNutricao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuplementosNutricao_PlanosNutricao_PlanoNutricaoId",
                        column: x => x.PlanoNutricaoId,
                        principalTable: "PlanosNutricao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedidasCorporais_PlanoNutricaoId",
                table: "MedidasCorporais",
                column: "PlanoNutricaoId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanosNutricao_AlunoId",
                table: "PlanosNutricao",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_RefeicoesNutricao_PlanoNutricaoId",
                table: "RefeicoesNutricao",
                column: "PlanoNutricaoId");

            migrationBuilder.CreateIndex(
                name: "IX_SuplementosNutricao_PlanoNutricaoId",
                table: "SuplementosNutricao",
                column: "PlanoNutricaoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedidasCorporais");

            migrationBuilder.DropTable(
                name: "RefeicoesNutricao");

            migrationBuilder.DropTable(
                name: "SuplementosNutricao");

            migrationBuilder.DropTable(
                name: "PlanosNutricao");
        }
    }
}
