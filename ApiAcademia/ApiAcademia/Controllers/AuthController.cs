using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Mvc;


namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/usuarios")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public IActionResult Criar([FromBody] CriarUserDTO dto)
    {
        _userService.Criar(dto);

        return Ok("Usuario cadastrado com sucesso");
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDTO dto)
    {
        var token = _userService.Login(dto);

        return Ok(new
        { Token = token });
    }
}
