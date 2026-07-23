using ApiAcademia.Business.DTOs.Nutricao;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Repository;

namespace ApiAcademia.Business.Services;

public interface INutricaoService
{
    List<PlanoNutricaoResponseDTO> Listar();

    PlanoNutricaoResponseDTO? BuscarPorId(int id);

    PlanoNutricaoResponseDTO? BuscarPorAluno(int alunoId);

    PlanoNutricaoResponseDTO Criar(SalvarPlanoNutricaoDTO dto);

    PlanoNutricaoResponseDTO? Atualizar(
        int id,
        SalvarPlanoNutricaoDTO dto
    );

    bool Remover(int id);

    MedidaCorporalResponseDTO? AdicionarMedida(
        int planoId,
        CriarMedidaCorporalDTO dto
    );
}

public class NutricaoService : INutricaoService
{
    private readonly INutricaoRepository _nutricaoRepository;

    public NutricaoService(
        INutricaoRepository nutricaoRepository
    )
    {
        _nutricaoRepository = nutricaoRepository;
    }

    public List<PlanoNutricaoResponseDTO> Listar()
    {
        return _nutricaoRepository
            .Listar()
            .Select(MapearResponse)
            .ToList();
    }

    public PlanoNutricaoResponseDTO? BuscarPorId(int id)
    {
        var plano = _nutricaoRepository.BuscarPorId(id);

        return plano == null
            ? null
            : MapearResponse(plano);
    }

    public PlanoNutricaoResponseDTO? BuscarPorAluno(int alunoId)
    {
        var plano =
            _nutricaoRepository.BuscarAtivoPorAluno(alunoId);

        return plano == null
            ? null
            : MapearResponse(plano);
    }

    public PlanoNutricaoResponseDTO Criar(
        SalvarPlanoNutricaoDTO dto
    )
    {
        Validar(dto);

        if (!_nutricaoRepository.AlunoExiste(dto.AlunoId))
        {
            throw new ArgumentException(
                "Aluno não encontrado."
            );
        }

        var plano = MapearEntidade(dto);
        var criado = _nutricaoRepository.Criar(plano);

        return MapearResponse(criado);
    }

    public PlanoNutricaoResponseDTO? Atualizar(
        int id,
        SalvarPlanoNutricaoDTO dto
    )
    {
        Validar(dto);

        var planoExistente =
            _nutricaoRepository.BuscarPorId(id);

        if (planoExistente == null)
        {
            return null;
        }

        if (planoExistente.AlunoId != dto.AlunoId)
        {
            throw new ArgumentException(
                "Não é permitido trocar o aluno do plano."
            );
        }

        var novosDados = MapearEntidade(dto);

        var atualizado =
            _nutricaoRepository.Atualizar(id, novosDados);

        return atualizado
            ? BuscarPorId(id)
            : null;
    }

    public bool Remover(int id)
    {
        return _nutricaoRepository.Remover(id);
    }

    public MedidaCorporalResponseDTO? AdicionarMedida(
        int planoId,
        CriarMedidaCorporalDTO dto
    )
    {
        if (dto.Peso <= 0)
        {
            throw new ArgumentException(
                "Informe um peso válido."
            );
        }

        var medida = new MedidaCorporalEntitie
        {
            Data =
                dto.Data == default
                    ? DateTime.Now
                    : dto.Data,

            Peso = dto.Peso,
            Cintura = dto.Cintura,
            Braco = dto.Braco,
            Peito = dto.Peito
        };

        var criada =
            _nutricaoRepository.AdicionarMedida(
                planoId,
                medida
            );

        return criada == null
            ? null
            : MapearMedida(criada);
    }

    private static void Validar(
        SalvarPlanoNutricaoDTO dto
    )
    {
        if (dto.AlunoId <= 0)
        {
            throw new ArgumentException(
                "Informe o aluno."
            );
        }

        if (dto.CaloriasMeta <= 0)
        {
            throw new ArgumentException(
                "A meta de calorias deve ser maior que zero."
            );
        }

        if (
            dto.ProteinasMeta < 0 ||
            dto.CarboidratosMeta < 0 ||
            dto.GordurasMeta < 0
        )
        {
            throw new ArgumentException(
                "As metas de macronutrientes não podem ser negativas."
            );
        }

        if (dto.AguaMetaLitros <= 0)
        {
            throw new ArgumentException(
                "A meta de água deve ser maior que zero."
            );
        }
    }

    private static PlanoNutricaoEntitie MapearEntidade(
        SalvarPlanoNutricaoDTO dto
    )
    {
        return new PlanoNutricaoEntitie
        {
            AlunoId = dto.AlunoId,

            DataInicio =
                dto.DataInicio == default
                    ? DateTime.Now
                    : dto.DataInicio,

            CaloriasMeta = dto.CaloriasMeta,
            ProteinasMeta = dto.ProteinasMeta,
            CarboidratosMeta = dto.CarboidratosMeta,
            GordurasMeta = dto.GordurasMeta,
            AguaMetaLitros = dto.AguaMetaLitros,
            Observacoes = dto.Observacoes.Trim(),
            Ativo = true,

            Refeicoes = dto.Refeicoes
                .Where(refeicao =>
                    !string.IsNullOrWhiteSpace(refeicao.Nome)
                )
                .OrderBy(refeicao => refeicao.Ordem)
                .Select(refeicao =>
                    new RefeicaoNutricaoEntitie
                    {
                        Nome = refeicao.Nome.Trim(),
                        Horario = refeicao.Horario.Trim(),
                        Alimentos = refeicao.Alimentos.Trim(),
                        Quantidades = refeicao.Quantidades.Trim(),
                        Calorias = refeicao.Calorias,
                        Ordem = refeicao.Ordem
                    }
                )
                .ToList(),

            Suplementos = dto.Suplementos
                .Where(suplemento =>
                    !string.IsNullOrWhiteSpace(suplemento.Nome)
                )
                .Select(suplemento =>
                    new SuplementoNutricaoEntitie
                    {
                        Nome = suplemento.Nome.Trim(),
                        Dosagem = suplemento.Dosagem.Trim()
                    }
                )
                .ToList()
        };
    }

    private static PlanoNutricaoResponseDTO MapearResponse(
        PlanoNutricaoEntitie plano
    )
    {
        return new PlanoNutricaoResponseDTO
        {
            Id = plano.Id,
            AlunoId = plano.AlunoId,
            Aluno =
                plano.Aluno?.Nome ??
                "Aluno não encontrado",

            DataInicio = plano.DataInicio,
            CaloriasMeta = plano.CaloriasMeta,
            ProteinasMeta = plano.ProteinasMeta,
            CarboidratosMeta = plano.CarboidratosMeta,
            GordurasMeta = plano.GordurasMeta,
            AguaMetaLitros = plano.AguaMetaLitros,
            Observacoes = plano.Observacoes,
            Ativo = plano.Ativo,

            Refeicoes = plano.Refeicoes
                .OrderBy(refeicao => refeicao.Ordem)
                .Select(refeicao =>
                    new RefeicaoNutricaoResponseDTO
                    {
                        Id = refeicao.Id,
                        Nome = refeicao.Nome,
                        Horario = refeicao.Horario,
                        Alimentos = refeicao.Alimentos,
                        Quantidades = refeicao.Quantidades,
                        Calorias = refeicao.Calorias,
                        Ordem = refeicao.Ordem
                    }
                )
                .ToList(),

            Medidas = plano.Medidas
                .OrderBy(medida => medida.Data)
                .Select(MapearMedida)
                .ToList(),

            Suplementos = plano.Suplementos
                .Select(suplemento =>
                    new SuplementoNutricaoResponseDTO
                    {
                        Id = suplemento.Id,
                        Nome = suplemento.Nome,
                        Dosagem = suplemento.Dosagem
                    }
                )
                .ToList()
        };
    }

    private static MedidaCorporalResponseDTO MapearMedida(
        MedidaCorporalEntitie medida
    )
    {
        return new MedidaCorporalResponseDTO
        {
            Id = medida.Id,
            Data = medida.Data,
            Peso = medida.Peso,
            Cintura = medida.Cintura,
            Braco = medida.Braco,
            Peito = medida.Peito
        };
    }
}
