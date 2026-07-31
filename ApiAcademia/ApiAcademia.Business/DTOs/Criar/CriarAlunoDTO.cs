namespace ApiAcademia.Business.DTOs.Criar;

public class CriarAlunoDTO
{
    public string Nome { get; set; }
    public double Peso { get; set; }
    public double Altura { get; set; }
    public string Email { get; set; }
    public string Telefone { get; set; }
    public string Cpf { get; set; }
    public DateOnly DataNascimento { get; set; }
}