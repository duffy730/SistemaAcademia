namespace ApiAcademia.Business.DTOs.Response;

public class AlunoResponseDTO
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    public double Peso { get; set; }
    public double Altura { get; set; }
    public int Idade { get; set; }
    public DateOnly DataNascimento { get; set; }
}
