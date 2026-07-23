using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Repository.Entities;

public class SuplementoNutricaoEntitie
{
    public int Id { get; set; }

    public int PlanoNutricaoId { get; set; }

    public PlanoNutricaoEntitie? PlanoNutricao { get; set; }

    [MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Dosagem { get; set; } = string.Empty;
}
