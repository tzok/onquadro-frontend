using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RNAqbase.Models.Search
{
    public abstract class Filter
    {
        public Dictionary<string, object> ParameterDictionary { get; set; } = new Dictionary<string, object>();
        public string FieldInSQL = "";
        protected bool isAnyValue = false;
        public JoinType joinType = JoinType.Where;        
        public abstract List<Condition> Conditions { get; set; }
        public abstract string Join();
        public string JoinConditions() 
        {
            if (!isValid())
            {
                return "";
            }
            return Join();
        }

        private bool isValid()
        {
            if (Conditions.Count == 0 || (isAnyValue && Conditions.Where(x => x.Value == "any").ToList().Any())) 
            {
                return false;
            }
            return true;
        }
    }

    public enum JoinType
    {
        Where,
        Having
    }
}