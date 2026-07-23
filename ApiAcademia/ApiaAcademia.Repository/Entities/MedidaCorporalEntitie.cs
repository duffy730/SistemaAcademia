namespace ApiAcademia.Repository.Entities;

public class MedidaCorporalEntitie
{
    public int Id { get; set; }

    public int PlanoNutricaoId { get; set; }

    public PlanoNutricaoEntitie? PlanoNutricao { get; set; }

    public DateTime Data { get; set; } = DateTime.Now;

    public decimal Peso { get; set; }

    public decimal? Cintura { get; set; }

    public decimal? Braco { get; set; }

    public decimal? Peito { get; set; }
}
