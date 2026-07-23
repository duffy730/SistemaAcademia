using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Repository.Entities;

public class PlanoNutricaoEntitie
{
    public int Id { get; set; }

    public int AlunoId { get; set; }

    public AlunoEntitie? Aluno { get; set; }

    public DateTime DataInicio { get; set; } = DateTime.Now;

    public int CaloriasMeta { get; set; }

    public decimal ProteinasMeta { get; set; }

    public decimal CarboidratosMeta { get; set; }

    public decimal GordurasMeta { get; set; }

    public decimal AguaMetaLitros { get; set; }

    [MaxLength(4000)]
    public string Observacoes { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    public ICollection<RefeicaoNutricaoEntitie> Refeicoes { get; set; } =
        new List<RefeicaoNutricaoEntitie>();

    public ICollection<MedidaCorporalEntitie> Medidas { get; set; } =
        new List<MedidaCorporalEntitie>();

    public ICollection<SuplementoNutricaoEntitie> Suplementos { get; set; } =
        new List<SuplementoNutricaoEntitie>();
}
