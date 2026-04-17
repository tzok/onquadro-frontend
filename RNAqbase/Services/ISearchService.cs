using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RNAqbase.Models;
using RNAqbase.Models.Search;

namespace RNAqbase.Services
{
    public interface ISearchService
    {
        Task<List<QuadruplexTable>> GetAllResults(List<Filter> filters);
        Task<List<string>> GetExperimentalMethod();
        Task<List<string>> GetONZ();
        Task<List<string>> GetIons();
        Task<List<string>> GetMoleculeType();
        Task<List<string>> GetWebbaDaSilva();
    }
}