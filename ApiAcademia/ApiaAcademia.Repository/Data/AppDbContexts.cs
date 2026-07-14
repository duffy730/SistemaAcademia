using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Contracts;

namespace ApiAcademia.Repository.Data;

public class AppDbContext : DbContext
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AlunoEntitie>()
            .Property(a => a.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<PlanoEntitie>()
            .Property(p => p.Valor)
            .HasPrecision(10, 2);

        modelBuilder.Entity<PagamentoEntitie>()
            .Property(p => p.Valor)
            .HasPrecision(10, 2);

        
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AlunoEntitie> Alunos { get; set; }

    public DbSet<PlanoEntitie> Planos { get; set; }

    public DbSet<MatriculaEntitie> Matriculas { get; set; }

    public DbSet<PagamentoEntitie> Pagamentos { get; set; }

    public DbSet<ProdutosEntitie> Produtos { get; set; }

    public DbSet<UserEntitie> Usuarios { get; set; }
}