namespace ApiAcademia.Repository.Entities;

public class AlunoEntitie
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public double Peso { get; set; }
    public double Altura { get; set; }
    public DateOnly DataNascimento { get; set; }
    public string Email { get; set; }
}
