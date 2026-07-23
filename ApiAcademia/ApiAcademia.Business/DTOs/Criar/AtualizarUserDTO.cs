using ApiAcademia.Business.DTOs.Criar;

namespace ApiAcademia.Business.DTOs.Atualizar;

public class AtualizarUserDTO
{
    public string Nome { get; set; } = string.Empty;

    public string Usuario { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public Roles Role { get; set; }

    public bool Ativo { get; set; }

    public string? Senha { get; set; }
}