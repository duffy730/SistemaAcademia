using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;


[ApiController]
[Route("api/pagamentos")]
public class PagamentoController : ControllerBase
{
    private readonly IPagamentoService _service;

    public PagamentoController(IPagamentoService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var pagamentos = _service.listaPagamento();

        return Ok(pagamentos);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var pagamento = _service.BuscarPorId(id);

        if (pagamento == null)
            return NotFound(new { messagem = "Pagamento não encontrado." });

        return Ok(pagamento);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPost("criar-pagamento")]
    public IActionResult Criar(
        [FromBody] CriarPagamentoDTO dto)
    {
        try
        {
            var resultado = _service.Criar(dto);

            if (!resultado)
            {
                return BadRequest(new
                {
                    mensagem = "Não foi possível criar o pagamento."
                });
            }

            return Ok(new
            {
                mensagem = "Pagamento criado com sucesso."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                mensagem = ex.Message
            });
        }
    }


    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-pagamento/{id}")]
    public IActionResult Atualizar(
        int id,
        [FromBody] CriarPagamentoDTO dto
    )
    {
        var resultado = _service.Atualizar(id, dto);

        if (!resultado)
        {
            return BadRequest(new
            {
                mensagem =
                    "Pagamento não encontrado ou estoque insuficiente."
            });
        }

        return Ok(new
        {
            mensagem = "Pagamento atualizado com sucesso."
        });
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpDelete("remover-pagamento/{id}")]
    public IActionResult Remover(int id)
    {
        var resultado = _service.Remover(id);

        if (!resultado)
        {
            return NotFound(new
            {
                mensagem = "Pagamento não encontrado."
            });
        }

        return Ok(new
        {
            mensagem = "Pagamento removido e estoque restaurado."
        });
    }
}

