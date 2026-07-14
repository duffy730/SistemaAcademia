using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized("O token não contém o e-mail do usuário.");
        }

        var usuario = _userService.BuscaPorEmail(email);

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