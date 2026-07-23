using ApiAcademia.Business.DTOs.Nutricao;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;

[ApiController]
[Route("api/nutricao")]
[Authorize]
public class NutricaoController : ControllerBase
{
    private readonly INutricaoService _nutricaoService;

    public NutricaoController(
        INutricaoService nutricaoService
    )
    {
        _nutricaoService = nutricaoService;
    }

    [HttpGet]
    public IActionResult Listar()
    {
        return Ok(_nutricaoService.Listar());
    }

    [HttpGet("{id:int}")]
    public IActionResult BuscarPorId(int id)
    {
        var plano =
            _nutricaoService.BuscarPorId(id);

        if (plano == null)
        {
            return NotFound(new
            {
                mensagem =
                    "Plano nutricional não encontrado."
            });
        }

        return Ok(plano);
    }

    [HttpGet("aluno/{alunoId:int}")]
    public IActionResult BuscarPorAluno(int alunoId)
    {
        var plano =
            _nutricaoService.BuscarPorAluno(alunoId);

        if (plano == null)
        {
            return NotFound(new
            {
                mensagem =
                    "O aluno ainda não possui um plano nutricional ativo."
            });
        }

        return Ok(plano);
    }

    [Authorize(Roles = "Admin,Nutri")]
    [HttpPost]
    public IActionResult Criar(
        [FromBody] SalvarPlanoNutricaoDTO dto
    )
    {
        try
        {
            var plano =
                _nutricaoService.Criar(dto);

            return CreatedAtAction(
                nameof(BuscarPorId),
                new { id = plano.Id },
                plano
            );
        }
        catch (ArgumentException error)
        {
            return BadRequest(new
            {
                mensagem = error.Message
            });
        }
    }

    [Authorize(Roles = "Admin,Nutri")]
    [HttpPut("{id:int}")]
    public IActionResult Atualizar(
        int id,
        [FromBody] SalvarPlanoNutricaoDTO dto
    )
    {
        try
        {
            var plano =
                _nutricaoService.Atualizar(id, dto);

            if (plano == null)
            {
                return NotFound(new
                {
                    mensagem =
                        "Plano nutricional não encontrado."
                });
            }

            return Ok(plano);
        }
        catch (ArgumentException error)
        {
            return BadRequest(new
            {
                mensagem = error.Message
            });
        }
    }

    [Authorize(Roles = "Admin,Nutri")]
    [HttpPost("{planoId:int}/medidas")]
    public IActionResult AdicionarMedida(
        int planoId,
        [FromBody] CriarMedidaCorporalDTO dto
    )
    {
        try
        {
            var medida =
                _nutricaoService.AdicionarMedida(
                    planoId,
                    dto
                );

            if (medida == null)
            {
                return NotFound(new
                {
                    mensagem =
                        "Plano nutricional não encontrado."
                });
            }

            return Ok(medida);
        }
        catch (ArgumentException error)
        {
            return BadRequest(new
            {
                mensagem = error.Message
            });
        }
    }

    [Authorize(Roles = "Admin,Nutri")]
    [HttpDelete("{id:int}")]
    public IActionResult Remover(int id)
    {
        var removido =
            _nutricaoService.Remover(id);

        if (!removido)
        {
            return NotFound(new
            {
                mensagem =
                    "Plano nutricional não encontrado."
            });
        }

        return NoContent();
    }
}
