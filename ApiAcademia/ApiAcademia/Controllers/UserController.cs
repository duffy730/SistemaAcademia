using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ApiAcademia.Business.DTOs.Atualizar;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var alunos = _userService.listaUser();

        return Ok(alunos);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var aluno = _userService.BuscarPorId(id);

        if (aluno == null)
            return NotFound(new { messagem = "Aluno não encontrado." });

        return Ok(aluno);
    }

[Authorize(Roles = "Admin")]
[HttpPut("atualizar-user/{id}")]
public IActionResult Atualizar(
    int id,
    [FromBody] AtualizarUserDTO dto)
{
    var resultado =
        _userService.Atualizar(id, dto);

    if (!resultado)
    {
        return NotFound(new
        {
            mensagem = "Usuário não encontrado."
        });
    }

    return Ok(new
    {
        mensagem = "Usuário atualizado com sucesso."
    });
}

    [Authorize(Roles = "Admin")]
    [HttpDelete("remover-user/{id}")]
    public IActionResult Remover(int id)
    {
        var removido = _userService.Remover(id);

        if (!removido)
        {
            return NotFound(new
            {
                mensagem = "Usuário não encontrado"
            });
        }

        return Ok(new
        {
            mensagem = "Usuário removido com sucesso"
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized("O token não contém o e-mail do usuário.");
        }

        var usuario = _userService.BuscarPorEmail(email);

        if (usuario == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        return Ok(new
        {
            nome = usuario.Nome,
            email = usuario.Usuario,
            role = usuario.Role.ToString()
        });
    }
}