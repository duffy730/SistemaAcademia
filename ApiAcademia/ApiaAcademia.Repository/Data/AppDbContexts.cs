using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Repository.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options
    ) : base(options)
    {
    }

    public DbSet<AlunoEntitie> Alunos { get; set; } = null!;

    public DbSet<PlanoEntitie> Planos { get; set; } = null!;

    public DbSet<MatriculaEntitie> Matriculas { get; set; } = null!;

    public DbSet<PagamentoEntitie> Pagamentos { get; set; } = null!;

    public DbSet<ProdutosEntitie> Produtos { get; set; } = null!;

    public DbSet<UserEntitie> Usuarios { get; set; } = null!;

    /*
     * Nutrição
     */
    public DbSet<PlanoNutricaoEntitie> PlanosNutricao { get; set; } = null!;

    public DbSet<RefeicaoNutricaoEntitie> RefeicoesNutricao { get; set; } =
        null!;

    public DbSet<MedidaCorporalEntitie> MedidasCorporais { get; set; } =
        null!;

    public DbSet<SuplementoNutricaoEntitie> SuplementosNutricao { get; set; } =
        null!;

    protected override void OnModelCreating(
        ModelBuilder modelBuilder
    )
    {
        base.OnModelCreating(modelBuilder);

        /*
         * Alunos
         */
        modelBuilder.Entity<AlunoEntitie>()
            .Property(aluno => aluno.Id)
            .ValueGeneratedOnAdd();

        /*
         * Planos
         */
        modelBuilder.Entity<PlanoEntitie>()
            .Property(plano => plano.Valor)
            .HasPrecision(10, 2);

        /*
         * Pagamentos
         */
        modelBuilder.Entity<PagamentoEntitie>()
            .Property(pagamento => pagamento.Valor)
            .HasPrecision(10, 2);

        /*
         * Plano nutricional pertence a um aluno.
         *
         * Restrict evita apagar os planos nutricionais
         * automaticamente ao tentar apagar um aluno.
         */
        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .HasOne(plano => plano.Aluno)
            .WithMany()
            .HasForeignKey(plano => plano.AlunoId)
            .OnDelete(DeleteBehavior.Restrict);

        /*
         * Refeições do plano nutricional.
         *
         * Ao apagar o plano, suas refeições são apagadas.
         */
        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .HasMany(plano => plano.Refeicoes)
            .WithOne(refeicao => refeicao.PlanoNutricao)
            .HasForeignKey(refeicao => refeicao.PlanoNutricaoId)
            .OnDelete(DeleteBehavior.Cascade);

        /*
         * Medidas corporais.
         */
        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .HasMany(plano => plano.Medidas)
            .WithOne(medida => medida.PlanoNutricao)
            .HasForeignKey(medida => medida.PlanoNutricaoId)
            .OnDelete(DeleteBehavior.Cascade);

        /*
         * Suplementos.
         */
        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .HasMany(plano => plano.Suplementos)
            .WithOne(suplemento => suplemento.PlanoNutricao)
            .HasForeignKey(suplemento => suplemento.PlanoNutricaoId)
            .OnDelete(DeleteBehavior.Cascade);

        /*
         * Precisão dos valores nutricionais.
         */
        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .Property(plano => plano.ProteinasMeta)
            .HasPrecision(10, 2);

        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .Property(plano => plano.CarboidratosMeta)
            .HasPrecision(10, 2);

        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .Property(plano => plano.GordurasMeta)
            .HasPrecision(10, 2);

        modelBuilder.Entity<PlanoNutricaoEntitie>()
            .Property(plano => plano.AguaMetaLitros)
            .HasPrecision(10, 2);

        /*
         * Precisão das medidas corporais.
         */
        modelBuilder.Entity<MedidaCorporalEntitie>()
            .Property(medida => medida.Peso)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MedidaCorporalEntitie>()
            .Property(medida => medida.Cintura)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MedidaCorporalEntitie>()
            .Property(medida => medida.Braco)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MedidaCorporalEntitie>()
            .Property(medida => medida.Peito)
            .HasPrecision(10, 2);
    }
}